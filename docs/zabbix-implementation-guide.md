# 🛠️ Guia Completo de Implementação - Integração Zabbix

## 📋 **VISÃO GERAL**

Este guia fornece instruções passo a passo para implementar a integração completa com Zabbix, incluindo código de exemplo, configurações e testes.

---

## 🗄️ **PASSO 1: CONFIGURAÇÃO DO BANCO DE DADOS**

### 1.1 Executar Migration
```bash
# Gerar e aplicar migration
pnpm --filter ./backend prisma migrate dev --name add_zabbix_integration

# Gerar cliente Prisma atualizado
pnpm --filter ./backend prisma generate
```

### 1.2 Seed de Dados (Opcional)
```typescript
// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedZabbixData() {
  // Criar configuração padrão para severidade
  const defaultSeverityMapping = {
    "0": "info",    // Not classified
    "1": "info",    // Information  
    "2": "low",     // Warning
    "3": "medium",  // Average
    "4": "high",    // High
    "5": "critical" // Disaster
  };

  console.log('Seed de dados Zabbix concluído');
}

seedZabbixData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 🔧 **PASSO 2: IMPLEMENTAÇÃO DOS SERVICES**

### 2.1 ZabbixServerService
```typescript
// backend/src/services/zabbixServerService.ts
import { PrismaClient } from '@prisma/client';
import { generateWebhookToken } from '../utils/tokenUtils';
import { encryptPassword, decryptPassword } from '../utils/cryptoUtils';
import axios from 'axios';

export class ZabbixServerService {
  constructor(private prisma: PrismaClient) {}

  async createServer(providerId: number, data: CreateZabbixServerDto) {
    // Verificar se nome já existe para o provedor
    const existingServer = await this.prisma.zabbixServer.findFirst({
      where: {
        providerId,
        name: data.name
      }
    });

    if (existingServer) {
      throw new ConflictError('Servidor com este nome já existe');
    }

    // Gerar token único para webhook
    const webhookToken = generateWebhookToken();

    // Criptografar senha se fornecida
    const encryptedPassword = data.password 
      ? await encryptPassword(data.password)
      : null;

    const server = await this.prisma.zabbixServer.create({
      data: {
        ...data,
        providerId,
        password: encryptedPassword,
        webhookToken,
      },
      include: {
        provider: true
      }
    });

    // Criar configuração padrão
    await this.createDefaultConfig(server.id);

    return {
      ...server,
      password: undefined, // Não retornar senha
      webhookUrl: `${process.env.API_BASE_URL}/api/webhooks/zabbix/${webhookToken}`
    };
  }

  async testConnection(serverId: number) {
    const server = await this.findById(serverId);
    
    const startTime = Date.now();
    
    try {
      // Tentar conectar via API Token
      if (server.apiToken) {
        const response = await axios.post(`${server.url}/api_jsonrpc.php`, {
          jsonrpc: "2.0",
          method: "apiinfo.version",
          params: {},
          auth: server.apiToken,
          id: 1
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const responseTime = Date.now() - startTime;

        // Obter estatísticas básicas
        const hostsResponse = await axios.post(`${server.url}/api_jsonrpc.php`, {
          jsonrpc: "2.0",
          method: "host.get",
          params: {
            countOutput: true
          },
          auth: server.apiToken,
          id: 2
        });

        const triggersResponse = await axios.post(`${server.url}/api_jsonrpc.php`, {
          jsonrpc: "2.0",
          method: "trigger.get",
          params: {
            countOutput: true
          },
          auth: server.apiToken,
          id: 3
        });

        // Atualizar última sincronização
        await this.prisma.zabbixServer.update({
          where: { id: serverId },
          data: { 
            lastSync: new Date(),
            version: response.data.result
          }
        });

        return {
          connected: true,
          responseTime,
          version: response.data.result,
          apiVersion: response.data.result,
          hostsCount: parseInt(hostsResponse.data.result),
          triggersCount: parseInt(triggersResponse.data.result),
          testedAt: new Date().toISOString()
        };
      }

      // Fallback: testar conectividade básica
      const response = await axios.get(`${server.url}/api_jsonrpc.php`, {
        timeout: 10000
      });

      const responseTime = Date.now() - startTime;

      return {
        connected: response.status === 200,
        responseTime,
        version: null,
        apiVersion: null,
        hostsCount: null,
        triggersCount: null,
        testedAt: new Date().toISOString()
      };

    } catch (error) {
      throw new BadRequestError('Falha na conexão com Zabbix', {
        url: server.url,
        error: error.message,
        testedAt: new Date().toISOString()
      });
    }
  }

  private async createDefaultConfig(zabbixServerId: number) {
    const defaultSeverityMapping = {
      "0": "info",
      "1": "info", 
      "2": "low",
      "3": "medium",
      "4": "high",
      "5": "critical"
    };

    return await this.prisma.zabbixConfig.create({
      data: {
        zabbixServerId,
        severityMapping: defaultSeverityMapping,
        minSeverity: 2,
        enabledTriggers: true,
        enabledHosts: true,
        enabledItems: false,
        autoCreateTickets: true,
        defaultPriority: 'medium',
        ticketPrefix: '[ZABBIX]',
        allowedHostGroups: [],
        blockedHostGroups: [],
        allowedTriggerTags: [],
        blockedTriggerTags: []
      }
    });
  }
}
```

### 2.2 ZabbixEventService
```typescript
// backend/src/services/zabbixEventService.ts
import { PrismaClient } from '@prisma/client';
import { TicketService } from './ticketService';

export class ZabbixEventService {
  constructor(
    private prisma: PrismaClient,
    private ticketService: TicketService
  ) {}

  async processWebhookEvent(webhookToken: string, payload: any) {
    // Encontrar servidor pelo webhook token
    const server = await this.prisma.zabbixServer.findUnique({
      where: { webhookToken },
      include: {
        config: true,
        provider: true
      }
    });

    if (!server) {
      throw new NotFoundError('Servidor Zabbix não encontrado');
    }

    if (!server.isActive) {
      throw new BadRequestError('Servidor Zabbix inativo');
    }

    // Validar e normalizar payload
    const normalizedPayload = this.normalizePayload(payload);

    // Verificar se evento já foi processado
    const existingEvent = await this.prisma.zabbixEvent.findUnique({
      where: {
        zabbixServerId_eventId: {
          zabbixServerId: server.id,
          eventId: normalizedPayload.eventId
        }
      }
    });

    if (existingEvent) {
      return {
        eventProcessed: true,
        ticketCreated: existingEvent.ticketCreated,
        ticketId: existingEvent.ticketId,
        reason: 'Evento já processado anteriormente'
      };
    }

    // Criar registro do evento
    const event = await this.prisma.zabbixEvent.create({
      data: {
        eventId: normalizedPayload.eventId,
        eventType: normalizedPayload.eventType,
        severity: normalizedPayload.severity,
        status: normalizedPayload.status,
        triggerName: normalizedPayload.trigger?.name,
        triggerTags: normalizedPayload.trigger?.tags || [],
        hostName: normalizedPayload.host?.name,
        hostGroups: normalizedPayload.host?.groups || [],
        itemName: normalizedPayload.item?.name,
        eventValue: normalizedPayload.item?.value,
        eventTime: new Date(normalizedPayload.timestamp),
        webhookPayload: payload,
        zabbixServerId: server.id,
        processed: false
      }
    });

    try {
      // Aplicar filtros de configuração
      const shouldCreateTicket = this.shouldCreateTicket(event, server.config);

      if (!shouldCreateTicket.create) {
        await this.prisma.zabbixEvent.update({
          where: { id: event.id },
          data: { 
            processed: true,
            ticketCreated: false
          }
        });

        return {
          eventProcessed: true,
          ticketCreated: false,
          reason: shouldCreateTicket.reason,
          eventId: event.eventId
        };
      }

      // Criar ticket automaticamente
      const ticket = await this.createTicketFromEvent(event, server);

      await this.prisma.zabbixEvent.update({
        where: { id: event.id },
        data: { 
          processed: true,
          ticketCreated: true,
          ticketId: ticket.id
        }
      });

      return {
        eventProcessed: true,
        ticketCreated: true,
        ticketId: ticket.id,
        eventId: event.eventId
      };

    } catch (error) {
      // Marcar evento com erro
      await this.prisma.zabbixEvent.update({
        where: { id: event.id },
        data: { 
          processed: true,
          ticketCreated: false,
          errorMessage: error.message,
          retryCount: { increment: 1 }
        }
      });

      throw error;
    }
  }

  private normalizePayload(payload: any) {
    return {
      eventId: payload.eventid || payload.eventId,
      eventType: payload.eventtype || payload.eventType || 'trigger',
      severity: parseInt(payload.severity) || 0,
      status: payload.status || 'UNKNOWN',
      trigger: payload.trigger ? {
        name: payload.trigger.name,
        severity: parseInt(payload.trigger.severity) || 0,
        tags: payload.trigger.tags || []
      } : null,
      host: payload.host ? {
        name: payload.host.name,
        groups: Array.isArray(payload.host.groups) 
          ? payload.host.groups 
          : (payload.host.groups || '').split(',').filter(Boolean)
      } : null,
      item: payload.item ? {
        name: payload.item.name,
        value: payload.item.value
      } : null,
      timestamp: payload.timestamp || new Date().toISOString()
    };
  }

  private shouldCreateTicket(event: any, config: any) {
    if (!config.autoCreateTickets) {
      return { create: false, reason: 'Criação automática de tickets desabilitada' };
    }

    if (event.severity < config.minSeverity) {
      return { create: false, reason: 'Severidade abaixo do mínimo configurado' };
    }

    // Filtrar por grupos de host
    if (config.allowedHostGroups.length > 0) {
      const hasAllowedGroup = event.hostGroups.some(group => 
        config.allowedHostGroups.includes(group)
      );
      if (!hasAllowedGroup) {
        return { create: false, reason: 'Host não está em grupo permitido' };
      }
    }

    if (config.blockedHostGroups.length > 0) {
      const hasBlockedGroup = event.hostGroups.some(group => 
        config.blockedHostGroups.includes(group)
      );
      if (hasBlockedGroup) {
        return { create: false, reason: 'Host está em grupo bloqueado' };
      }
    }

    // Filtrar por tags de trigger
    if (config.allowedTriggerTags.length > 0) {
      const hasAllowedTag = event.triggerTags.some(tag => 
        config.allowedTriggerTags.includes(tag)
      );
      if (!hasAllowedTag) {
        return { create: false, reason: 'Trigger não possui tag permitida' };
      }
    }

    if (config.blockedTriggerTags.length > 0) {
      const hasBlockedTag = event.triggerTags.some(tag => 
        config.blockedTriggerTags.includes(tag)
      );
      if (hasBlockedTag) {
        return { create: false, reason: 'Trigger possui tag bloqueada' };
      }
    }

    return { create: true };
  }

  private async createTicketFromEvent(event: any, server: any) {
    const config = server.config;
    
    // Mapear severidade para prioridade
    const priorityMapping = {
      0: 'low',
      1: 'low',
      2: 'low',
      3: 'medium',
      4: 'high',
      5: 'critical'
    };

    const priority = config.severityMapping[event.severity.toString()] || config.defaultPriority;

    // Gerar título do ticket
    let title = `${config.ticketPrefix} ${event.triggerName || 'Evento Zabbix'}`;
    
    if (config.ticketTemplate) {
      title = config.ticketTemplate
        .replace('{trigger.name}', event.triggerName || 'N/A')
        .replace('{host.name}', event.hostName || 'N/A')
        .replace('{trigger.severity}', event.severity.toString())
        .replace('{item.value}', event.eventValue || 'N/A');
    }

    // Gerar descrição detalhada
    const description = this.generateTicketDescription(event);

    return await this.ticketService.create({
      title,
      description,
      priority,
      source: 'zabbix',
      providerId: server.providerId
    });
  }

  private generateTicketDescription(event: any) {
    const lines = [
      '🚨 **Evento Zabbix Detectado**',
      '',
      `**Trigger:** ${event.triggerName || 'N/A'}`,
      `**Host:** ${event.hostName || 'N/A'}`,
      `**Status:** ${event.status}`,
      `**Severidade:** ${event.severity} (${this.getSeverityName(event.severity)})`,
      `**Horário:** ${event.eventTime}`,
      ''
    ];

    if (event.hostGroups.length > 0) {
      lines.push(`**Grupos do Host:** ${event.hostGroups.join(', ')}`);
    }

    if (event.triggerTags.length > 0) {
      lines.push(`**Tags:** ${event.triggerTags.join(', ')}`);
    }

    if (event.itemName) {
      lines.push(`**Item:** ${event.itemName}`);
    }

    if (event.eventValue) {
      lines.push(`**Valor:** ${event.eventValue}`);
    }

    lines.push('');
    lines.push('---');
    lines.push('*Ticket criado automaticamente pela integração Zabbix*');

    return lines.join('\n');
  }

  private getSeverityName(severity: number): string {
    const names = {
      0: 'Not classified',
      1: 'Information',
      2: 'Warning',
      3: 'Average',
      4: 'High',
      5: 'Disaster'
    };
    return names[severity] || 'Unknown';
  }
}
```

---

## 🎮 **PASSO 3: IMPLEMENTAÇÃO DOS CONTROLLERS**

### 3.1 ZabbixServerController
```typescript
// backend/src/controllers/zabbixServerController.ts
import { Request, Response } from 'express';
import { ZabbixServerService } from '../services/zabbixServerService';
import { createZabbixServerSchema, updateZabbixServerSchema } from '../validators/zabbixValidators';

export class ZabbixServerController {
  constructor(private zabbixServerService: ZabbixServerService) {}

  async create(req: Request, res: Response) {
    try {
      const providerId = parseInt(req.params.providerId);
      const validatedData = createZabbixServerSchema.parse(req.body);

      const server = await this.zabbixServerService.createServer(providerId, validatedData);

      res.status(201).json({
        success: true,
        data: server,
        webhookUrl: server.webhookUrl
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response) {
    try {
      const providerId = parseInt(req.params.providerId);
      const { page = 1, limit = 10, active } = req.query;

      const filters = {
        providerId,
        ...(active !== undefined && { isActive: active === 'true' })
      };

      const servers = await this.zabbixServerService.findMany(filters, {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: servers.data,
        pagination: servers.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const server = await this.zabbixServerService.findByIdWithDetails(id);

      res.json({
        success: true,
        data: server
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateZabbixServerSchema.parse(req.body);

      const server = await this.zabbixServerService.update(id, validatedData);

      res.json({
        success: true,
        data: server
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await this.zabbixServerService.delete(id);

      res.json({
        success: true,
        message: 'Servidor Zabbix removido com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async testConnection(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await this.zabbixServerService.testConnection(id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
```

### 3.2 ZabbixWebhookController
```typescript
// backend/src/controllers/zabbixWebhookController.ts
import { Request, Response } from 'express';
import { ZabbixEventService } from '../services/zabbixEventService';
import { logger } from '../utils/logger';

export class ZabbixWebhookController {
  constructor(private zabbixEventService: ZabbixEventService) {}

  async receiveWebhook(req: Request, res: Response) {
    const webhookToken = req.params.webhookToken;
    const payload = req.body;

    try {
      logger.info('Webhook Zabbix recebido', {
        webhookToken,
        eventId: payload.eventid || payload.eventId,
        severity: payload.severity,
        status: payload.status
      });

      const result = await this.zabbixEventService.processWebhookEvent(webhookToken, payload);

      logger.info('Webhook Zabbix processado', {
        webhookToken,
        eventId: result.eventId,
        ticketCreated: result.ticketCreated,
        ticketId: result.ticketId
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Erro ao processar webhook Zabbix', {
        webhookToken,
        error: error.message,
        payload
      });

      res.status(400).json({
        success: false,
        error: {
          code: 'WEBHOOK_PROCESSING_FAILED',
          message: error.message
        }
      });
    }
  }

  async getEvents(req: Request, res: Response) {
    try {
      const serverId = parseInt(req.params.serverId);
      const {
        page = 1,
        limit = 20,
        processed,
        severity,
        status,
        dateFrom,
        dateTo
      } = req.query;

      const filters = {
        zabbixServerId: serverId,
        ...(processed !== undefined && { processed: processed === 'true' }),
        ...(severity && { severity: parseInt(severity as string) }),
        ...(status && { status: status as string }),
        ...(dateFrom && { eventTime: { gte: new Date(dateFrom as string) } }),
        ...(dateTo && { eventTime: { lte: new Date(dateTo as string) } })
      };

      const events = await this.zabbixEventService.findMany(filters, {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: events.data,
        pagination: events.pagination,
        filters
      });
    } catch (error) {
      next(error);
    }
  }

  async reprocessEvent(req: Request, res: Response) {
    try {
      const serverId = parseInt(req.params.serverId);
      const eventId = req.params.eventId;

      const result = await this.zabbixEventService.reprocessEvent(serverId, eventId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const serverId = parseInt(req.params.serverId);
      const { dateFrom, dateTo } = req.query;

      const stats = await this.zabbixEventService.getStats(serverId, {
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}
```

---

## 🛡️ **PASSO 4: VALIDADORES ZOD**

```typescript
// backend/src/validators/zabbixValidators.ts
import { z } from 'zod';

export const createZabbixServerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  url: z.string()
    .url('URL inválida')
    .refine(url => url.startsWith('http'), {
      message: 'URL deve começar com http ou https'
    }),
  version: z.string().optional(),
  apiToken: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  isActive: z.boolean().default(true)
}).refine(data => data.apiToken || (data.username && data.password), {
  message: 'Deve fornecer apiToken OU username+password para autenticação'
});

export const updateZabbixServerSchema = createZabbixServerSchema.partial();

export const updateZabbixConfigSchema = z.object({
  enabledTriggers: z.boolean().optional(),
  enabledHosts: z.boolean().optional(),
  enabledItems: z.boolean().optional(),
  severityMapping: z.record(
    z.enum(['info', 'low', 'medium', 'high', 'critical'])
  ).optional(),
  minSeverity: z.number().min(0).max(5).optional(),
  allowedHostGroups: z.array(z.string()).optional(),
  blockedHostGroups: z.array(z.string()).optional(),
  allowedTriggerTags: z.array(z.string()).optional(),
  blockedTriggerTags: z.array(z.string()).optional(),
  autoCreateTickets: z.boolean().optional(),
  defaultPriority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  ticketPrefix: z.string().max(20).optional(),
  ticketTemplate: z.string().max(500).optional()
});

export const webhookEventSchema = z.object({
  eventid: z.string(),
  eventtype: z.string().optional(),
  severity: z.number().min(0).max(5),
  status: z.string(),
  trigger: z.object({
    name: z.string(),
    severity: z.number().optional(),
    tags: z.array(z.string()).optional()
  }).optional(),
  host: z.object({
    name: z.string(),
    groups: z.union([z.array(z.string()), z.string()]).optional()
  }).optional(),
  item: z.object({
    name: z.string().optional(),
    value: z.string().optional()
  }).optional(),
  timestamp: z.string().optional()
});
```

---

## 🛣️ **PASSO 5: CONFIGURAÇÃO DAS ROTAS**

```typescript
// backend/src/routes/zabbixRoutes.ts
import { Router } from 'express';
import { ZabbixServerController } from '../controllers/zabbixServerController';
import { ZabbixWebhookController } from '../controllers/zabbixWebhookController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateProvider } from '../middlewares/validateProvider';

const router = Router();

// Instanciar controllers
const zabbixServerController = new ZabbixServerController(zabbixServerService);
const zabbixWebhookController = new ZabbixWebhookController(zabbixEventService);

// Rotas protegidas - Gerenciamento de Servidores
router.post('/providers/:providerId/zabbix-servers', 
  authMiddleware, 
  validateProvider,
  zabbixServerController.create.bind(zabbixServerController)
);

router.get('/providers/:providerId/zabbix-servers',
  authMiddleware,
  validateProvider,
  zabbixServerController.list.bind(zabbixServerController)
);

router.get('/zabbix-servers/:id',
  authMiddleware,
  zabbixServerController.getById.bind(zabbixServerController)
);

router.put('/zabbix-servers/:id',
  authMiddleware,
  zabbixServerController.update.bind(zabbixServerController)
);

router.delete('/zabbix-servers/:id',
  authMiddleware,
  zabbixServerController.delete.bind(zabbixServerController)
);

router.post('/zabbix-servers/:id/test-connection',
  authMiddleware,
  zabbixServerController.testConnection.bind(zabbixServerController)
);

// Rotas públicas - Webhooks
router.post('/webhooks/zabbix/:webhookToken',
  zabbixWebhookController.receiveWebhook.bind(zabbixWebhookController)
);

// Rotas protegidas - Eventos
router.get('/zabbix-servers/:serverId/events',
  authMiddleware,
  zabbixWebhookController.getEvents.bind(zabbixWebhookController)
);

router.post('/zabbix-servers/:serverId/events/:eventId/reprocess',
  authMiddleware,
  zabbixWebhookController.reprocessEvent.bind(zabbixWebhookController)
);

router.get('/zabbix-servers/:serverId/stats',
  authMiddleware,
  zabbixWebhookController.getStats.bind(zabbixWebhookController)
);

export { router as zabbixRoutes };
```

---

## 🔧 **PASSO 6: UTILITÁRIOS**

### 6.1 Geração de Tokens
```typescript
// backend/src/utils/tokenUtils.ts
import crypto from 'crypto';

export function generateWebhookToken(): string {
  return 'whk_' + crypto.randomBytes(16).toString('hex');
}

export function validateWebhookToken(token: string): boolean {
  return /^whk_[a-f0-9]{32}$/.test(token);
}
```

### 6.2 Criptografia
```typescript
// backend/src/utils/cryptoUtils.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;

export async function encryptPassword(password: string): Promise<string> {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

export async function decryptPassword(encryptedPassword: string): Promise<string> {
  const [ivHex, encrypted] = encryptedPassword.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## 🧪 **PASSO 7: TESTES**

### 7.1 Teste de Integração
```typescript
// backend/src/__tests__/zabbix.integration.test.ts
import request from 'supertest';
import { app } from '../server';
import { prisma } from '../utils/database';

describe('Zabbix Integration', () => {
  let authToken: string;
  let providerId: number;
  let serverId: number;

  beforeAll(async () => {
    // Setup de teste
    const authResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = authResponse.body.token;

    // Criar provedor de teste
    const provider = await prisma.provider.create({
      data: {
        name: 'Provedor Teste',
        cnpj: '12.345.678/0001-90',
        workspace: 'provedor-teste',
        ownerId: 1
      }
    });

    providerId = provider.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.zabbixEvent.deleteMany();
    await prisma.zabbixConfig.deleteMany();
    await prisma.zabbixServer.deleteMany();
    await prisma.provider.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/providers/:providerId/zabbix-servers', () => {
    it('deve criar servidor Zabbix com dados válidos', async () => {
      const serverData = {
        name: 'Zabbix Teste',
        url: 'https://zabbix.teste.com',
        version: '6.4.0',
        apiToken: 'test_token_123',
        isActive: true
      };

      const response = await request(app)
        .post(`/api/providers/${providerId}/zabbix-servers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(serverData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(serverData.name);
      expect(response.body.data.webhookToken).toMatch(/^whk_[a-f0-9]{32}$/);
      expect(response.body.webhookUrl).toContain('/api/webhooks/zabbix/');

      serverId = response.body.data.id;
    });

    it('deve rejeitar dados inválidos', async () => {
      const invalidData = {
        name: 'A', // Muito curto
        url: 'invalid-url',
        // Sem autenticação
      };

      await request(app)
        .post(`/api/providers/${providerId}/zabbix-servers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /api/webhooks/zabbix/:webhookToken', () => {
    it('deve processar webhook válido', async () => {
      // Obter webhook token
      const server = await prisma.zabbixServer.findUnique({
        where: { id: serverId }
      });

      const webhookPayload = {
        eventid: '12345',
        eventtype: 'trigger',
        severity: 4,
        status: 'PROBLEM',
        trigger: {
          name: 'CPU usage > 90%',
          severity: 4,
          tags: ['production']
        },
        host: {
          name: 'srv-web-01',
          groups: ['Servidores', 'Web Servers']
        },
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post(`/api/webhooks/zabbix/${server.webhookToken}`)
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventProcessed).toBe(true);
      expect(response.body.data.ticketCreated).toBe(true);
    });

    it('deve rejeitar webhook com token inválido', async () => {
      await request(app)
        .post('/api/webhooks/zabbix/invalid_token')
        .send({ eventid: '123' })
        .expect(404);
    });
  });
});
```

### 7.2 Teste de Unidade
```typescript
// backend/src/__tests__/zabbixEventService.unit.test.ts
import { ZabbixEventService } from '../services/zabbixEventService';
import { PrismaClient } from '@prisma/client';

const mockPrisma = {
  zabbixServer: {
    findUnique: jest.fn()
  },
  zabbixEvent: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
} as any;

const mockTicketService = {
  create: jest.fn()
} as any;

describe('ZabbixEventService', () => {
  let service: ZabbixEventService;

  beforeEach(() => {
    service = new ZabbixEventService(mockPrisma, mockTicketService);
    jest.clearAllMocks();
  });

  describe('processWebhookEvent', () => {
    it('deve processar evento e criar ticket', async () => {
      const mockServer = {
        id: 1,
        isActive: true,
        providerId: 1,
        config: {
          autoCreateTickets: true,
          minSeverity: 2,
          defaultPriority: 'medium',
          ticketPrefix: '[ZABBIX]',
          allowedHostGroups: [],
          blockedHostGroups: [],
          allowedTriggerTags: [],
          blockedTriggerTags: []
        }
      };

      const mockTicket = { id: 123 };

      mockPrisma.zabbixServer.findUnique.mockResolvedValue(mockServer);
      mockPrisma.zabbixEvent.findUnique.mockResolvedValue(null);
      mockPrisma.zabbixEvent.create.mockResolvedValue({ id: 1 });
      mockPrisma.zabbixEvent.update.mockResolvedValue({});
      mockTicketService.create.mockResolvedValue(mockTicket);

      const payload = {
        eventid: '12345',
        severity: 4,
        status: 'PROBLEM',
        trigger: { name: 'Test Trigger' },
        host: { name: 'test-host', groups: ['Servers'] }
      };

      const result = await service.processWebhookEvent('test_token', payload);

      expect(result.eventProcessed).toBe(true);
      expect(result.ticketCreated).toBe(true);
      expect(result.ticketId).toBe(123);
    });

    it('deve filtrar evento por severidade mínima', async () => {
      const mockServer = {
        id: 1,
        isActive: true,
        config: {
          autoCreateTickets: true,
          minSeverity: 4, // Severidade alta
          allowedHostGroups: [],
          blockedHostGroups: [],
          allowedTriggerTags: [],
          blockedTriggerTags: []
        }
      };

      mockPrisma.zabbixServer.findUnique.mockResolvedValue(mockServer);
      mockPrisma.zabbixEvent.findUnique.mockResolvedValue(null);
      mockPrisma.zabbixEvent.create.mockResolvedValue({ id: 1 });
      mockPrisma.zabbixEvent.update.mockResolvedValue({});

      const payload = {
        eventid: '12345',
        severity: 2, // Severidade baixa
        status: 'PROBLEM'
      };

      const result = await service.processWebhookEvent('test_token', payload);

      expect(result.eventProcessed).toBe(true);
      expect(result.ticketCreated).toBe(false);
      expect(result.reason).toContain('Severidade abaixo do mínimo');
    });
  });
});
```

---

## 🚀 **PASSO 8: CONFIGURAÇÃO NO ZABBIX**

### 8.1 Media Type (Webhook)
```javascript
// Nome: Sistema Gerenciamento Provedores
// Tipo: Webhook
// URL: {$WEBHOOK_URL}

// Script:
var req = new HttpRequest();
req.addHeader('Content-Type: application/json');
req.addHeader('X-Zabbix-Webhook: true');

var payload = {
    eventid: params.eventid,
    eventtype: params.eventtype || 'trigger',
    severity: parseInt(params.severity) || 0,
    status: params.status,
    trigger: {
        name: params.trigger_name,
        severity: parseInt(params.trigger_severity) || 0,
        tags: params.trigger_tags ? params.trigger_tags.split(',') : []
    },
    host: {
        name: params.host_name,
        groups: params.host_groups ? params.host_groups.split(',') : []
    },
    item: {
        name: params.item_name,
        value: params.item_value
    },
    timestamp: params.event_date + ' ' + params.event_time,
    acknowledge: {
        status: params.event_ack_status || 'unacknowledged'
    }
};

Zabbix.log(4, 'Enviando webhook para Sistema Gerenciamento: ' + JSON.stringify(payload));

var response = req.post('{$WEBHOOK_URL}', JSON.stringify(payload));

if (req.getStatus() !== 200) {
    throw 'Falha no webhook. Status: ' + req.getStatus() + ', Response: ' + response;
}

return 'Webhook enviado com sucesso';
```

### 8.2 Action Configuration
```
Nome: Criar Ticket - Sistema Gerenciamento
Condições:
- Trigger severity >= Warning (2)
- Host group matches: (grupos configurados)
- Trigger tag matches: production (opcional)

Operações:
- Send message via: Sistema Gerenciamento Provedores
- Send to users: webhook-user
- Subject: {TRIGGER.NAME}
- Message: Evento detectado em {HOST.NAME}

Recovery Operations:
- Send message via: Sistema Gerenciamento Provedores
- Subject: RESOLVED: {TRIGGER.NAME}
- Message: Problema resolvido em {HOST.NAME}
```

---

## 🔍 **PASSO 9: MONITORAMENTO E LOGS**

### 9.1 Configuração de Logs
```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'zabbix-integration' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/zabbix-error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/zabbix-combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### 9.2 Middleware de Auditoria
```typescript
// backend/src/middlewares/auditMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function auditZabbixOperations(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;

  res.send = function(data) {
    // Log da operação
    logger.info('Operação Zabbix executada', {
      method: req.method,
      url: req.url,
      userId: req.user?.id,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString()
    });

    return originalSend.call(this, data);
  };

  next();
}
```

---

## 📊 **PASSO 10: DASHBOARD E MÉTRICAS**

### 10.1 Endpoint de Métricas
```typescript
// backend/src/controllers/zabbixMetricsController.ts
export class ZabbixMetricsController {
  async getGlobalStats(req: Request, res: Response) {
    const stats = await this.prisma.$transaction(async (tx) => {
      const totalServers = await tx.zabbixServer.count({
        where: { isActive: true }
      });

      const totalEvents = await tx.zabbixEvent.count();
      
      const processedEvents = await tx.zabbixEvent.count({
        where: { processed: true }
      });

      const ticketsCreated = await tx.zabbixEvent.count({
        where: { ticketCreated: true }
      });

      const eventsByStatus = await tx.zabbixEvent.groupBy({
        by: ['status'],
        _count: { id: true }
      });

      const eventsBySeverity = await tx.zabbixEvent.groupBy({
        by: ['severity'],
        _count: { id: true }
      });

      return {
        servers: { total: totalServers },
        events: {
          total: totalEvents,
          processed: processedEvents,
          successRate: totalEvents > 0 ? (processedEvents / totalEvents) * 100 : 0,
          byStatus: eventsByStatus,
          bySeverity: eventsBySeverity
        },
        tickets: { created: ticketsCreated }
      };
    });

    res.json({ success: true, data: stats });
  }
}
```

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

### 📋 Backend
- [ ] Models Prisma criados e migration executada
- [ ] ZabbixServerService implementado
- [ ] ZabbixEventService implementado
- [ ] Controllers criados
- [ ] Validadores Zod configurados
- [ ] Rotas definidas
- [ ] Middlewares de segurança
- [ ] Utilitários (tokens, criptografia)
- [ ] Logs e auditoria
- [ ] Testes unitários e integração

### 📋 Zabbix
- [ ] Media Type configurado
- [ ] Actions criadas
- [ ] Macros definidas
- [ ] Usuário webhook criado
- [ ] Permissões configuradas

### 📋 Segurança
- [ ] Tokens únicos por servidor
- [ ] Rate limiting configurado
- [ ] Validação de origem
- [ ] Logs de auditoria
- [ ] Criptografia de senhas

### 📋 Monitoramento
- [ ] Logs estruturados
- [ ] Métricas de performance
- [ ] Dashboard de estatísticas
- [ ] Alertas de falha

---

*Guia Completo de Implementação - Integração Zabbix*  
*Versão: 1.0 | Atualizado: Janeiro 2025*