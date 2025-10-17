# 🔗 Integração Zabbix - Sistema de Gerenciamento de Provedores

## 📋 Visão Geral
Integração completa com Zabbix para criação automática de tickets baseada em eventos de monitoramento. Permite cadastrar servidores Zabbix por cliente/provedor e receber webhooks para gerar tickets automaticamente.

---

## 🎯 **FUNCIONALIDADES DA INTEGRAÇÃO**

### ✅ Recursos Principais
- **Cadastro de Servidores Zabbix** por provedor/cliente
- **Webhook Endpoint** para receber eventos do Zabbix
- **Criação Automática de Tickets** baseada em eventos
- **Mapeamento de Severidade** (Zabbix → Sistema)
- **Filtros de Eventos** configuráveis
- **Log de Integração** para auditoria
- **Configurações Personalizadas** por servidor

---

## 🗄️ **MODELS DO BANCO DE DADOS**

### 📊 Schema Prisma - Novos Models

```prisma
// Servidor Zabbix cadastrado para um provedor
model ZabbixServer {
  id          Int      @id @default(autoincrement())
  name        String   // Nome identificador do servidor
  url         String   // URL da API do Zabbix
  version     String?  // Versão do Zabbix
  apiToken    String?  // Token de API (se necessário)
  username    String?  // Usuário para autenticação
  password    String?  // Senha criptografada
  isActive    Boolean  @default(true)
  
  // Relacionamento com provedor
  provider    Provider @relation(fields: [providerId], references: [id])
  providerId  Int
  
  // Configurações da integração
  configs     ZabbixConfig[]
  events      ZabbixEvent[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([providerId, name])
}

// Configurações de integração por servidor
model ZabbixConfig {
  id                    Int      @id @default(autoincrement())
  
  // Filtros de eventos
  enabledTriggers       Boolean  @default(true)
  enabledHosts          Boolean  @default(true)
  enabledItems          Boolean  @default(false)
  
  // Mapeamento de severidade
  severityMapping       Json     // {"0": "low", "1": "medium", "2": "high", "3": "critical"}
  
  // Filtros por severidade mínima
  minSeverity          Int      @default(0)
  
  // Filtros por grupos de hosts
  allowedHostGroups    String[] // Array de grupos permitidos
  blockedHostGroups    String[] // Array de grupos bloqueados
  
  // Configurações de ticket
  autoCreateTickets    Boolean  @default(true)
  defaultPriority      String   @default("medium")
  ticketPrefix         String   @default("[ZABBIX]")
  
  // Relacionamento
  zabbixServer         ZabbixServer @relation(fields: [zabbixServerId], references: [id])
  zabbixServerId       Int          @unique
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

// Log de eventos recebidos do Zabbix
model ZabbixEvent {
  id              Int      @id @default(autoincrement())
  
  // Dados do evento Zabbix
  eventId         String   // ID do evento no Zabbix
  eventType       String   // trigger, host, item, etc.
  severity        Int      // Severidade no Zabbix (0-5)
  status          String   // OK, PROBLEM, etc.
  
  // Dados do trigger/host
  triggerName     String?
  hostName        String?
  hostGroup       String?
  itemName        String?
  
  // Dados do webhook
  webhookPayload  Json     // Payload completo recebido
  
  // Processamento
  processed       Boolean  @default(false)
  ticketCreated   Boolean  @default(false)
  errorMessage    String?
  
  // Relacionamentos
  zabbixServer    ZabbixServer @relation(fields: [zabbixServerId], references: [id])
  zabbixServerId  Int
  
  ticket          Ticket?  @relation(fields: [ticketId], references: [id])
  ticketId        Int?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([zabbixServerId, eventId])
}

// Atualizar model Ticket para incluir origem Zabbix
model Ticket {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  status      String   @default("open")
  priority    String   @default("medium")
  
  // Origem do ticket
  source      String   @default("manual") // manual, zabbix, api
  
  // Relacionamentos existentes
  provider    Provider @relation(fields: [providerId], references: [id])
  providerId  Int
  
  // Novo relacionamento com eventos Zabbix
  zabbixEvents ZabbixEvent[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Atualizar model Provider para incluir servidores Zabbix
model Provider {
  id        Int      @id @default(autoincrement())
  name      String
  cnpj      String   @unique
  workspace String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner   User   @relation(fields: [ownerId], references: [id])
  ownerId Int

  equipments    Equipment[]
  tickets       Ticket[]
  passwords     PasswordVault[]
  zabbixServers ZabbixServer[] // Nova relação
}
```

---

## 🛠️ **CONTROLLERS E ENDPOINTS**

### 📡 ZabbixServerController

```typescript
// src/controllers/zabbixServerController.ts

export class ZabbixServerController {
  
  // POST /providers/:providerId/zabbix-servers
  async createServer(req: Request, res: Response): Promise<void>
  
  // GET /providers/:providerId/zabbix-servers
  async listServers(req: Request, res: Response): Promise<void>
  
  // GET /zabbix-servers/:id
  async getServer(req: Request, res: Response): Promise<void>
  
  // PUT /zabbix-servers/:id
  async updateServer(req: Request, res: Response): Promise<void>
  
  // DELETE /zabbix-servers/:id
  async deleteServer(req: Request, res: Response): Promise<void>
  
  // POST /zabbix-servers/:id/test-connection
  async testConnection(req: Request, res: Response): Promise<void>
  
  // GET /zabbix-servers/:id/config
  async getConfig(req: Request, res: Response): Promise<void>
  
  // PUT /zabbix-servers/:id/config
  async updateConfig(req: Request, res: Response): Promise<void>
}
```

### 🎣 ZabbixWebhookController

```typescript
// src/controllers/zabbixWebhookController.ts

export class ZabbixWebhookController {
  
  // POST /webhooks/zabbix/:serverId
  async receiveEvent(req: Request, res: Response): Promise<void>
  
  // GET /webhooks/zabbix/:serverId/events
  async listEvents(req: Request, res: Response): Promise<void>
  
  // POST /webhooks/zabbix/:serverId/events/:eventId/reprocess
  async reprocessEvent(req: Request, res: Response): Promise<void>
  
  // GET /webhooks/zabbix/:serverId/stats
  async getStats(req: Request, res: Response): Promise<void>
}
```

---

## 🔧 **SERVICES E REPOSITORIES**

### 🏗️ ZabbixServerService

```typescript
// src/services/zabbixServerService.ts

export class ZabbixServerService {
  
  // Gerenciamento de servidores
  async createServer(data: CreateZabbixServerDto): Promise<ZabbixServer>
  async updateServer(id: number, data: UpdateZabbixServerDto): Promise<ZabbixServer>
  async deleteServer(id: number): Promise<void>
  async getServersByProvider(providerId: number): Promise<ZabbixServer[]>
  
  // Teste de conexão
  async testConnection(serverId: number): Promise<ConnectionTestResult>
  
  // Configurações
  async updateConfig(serverId: number, config: ZabbixConfigDto): Promise<ZabbixConfig>
  async getConfig(serverId: number): Promise<ZabbixConfig>
}
```

### 🎯 ZabbixEventService

```typescript
// src/services/zabbixEventService.ts

export class ZabbixEventService {
  
  // Processamento de eventos
  async processWebhookEvent(serverId: number, payload: any): Promise<ProcessResult>
  async shouldCreateTicket(event: ZabbixEventData, config: ZabbixConfig): Promise<boolean>
  async createTicketFromEvent(event: ZabbixEventData, server: ZabbixServer): Promise<Ticket>
  
  // Mapeamento de dados
  async mapSeverity(zabbixSeverity: number, config: ZabbixConfig): Promise<string>
  async mapPriority(severity: string): Promise<string>
  async generateTicketTitle(event: ZabbixEventData): Promise<string>
  async generateTicketDescription(event: ZabbixEventData): Promise<string>
  
  // Filtros
  async isHostGroupAllowed(hostGroup: string, config: ZabbixConfig): Promise<boolean>
  async isSeverityAllowed(severity: number, config: ZabbixConfig): Promise<boolean>
}
```

---

## 📋 **VALIDADORES ZOD**

### ✅ ZabbixValidators

```typescript
// src/validators/zabbixValidators.ts

import { z } from 'zod';

export const createZabbixServerSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  version: z.string().optional(),
  apiToken: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const updateZabbixServerSchema = createZabbixServerSchema.partial();

export const zabbixConfigSchema = z.object({
  enabledTriggers: z.boolean().default(true),
  enabledHosts: z.boolean().default(true),
  enabledItems: z.boolean().default(false),
  severityMapping: z.record(z.string()),
  minSeverity: z.number().min(0).max(5).default(0),
  allowedHostGroups: z.array(z.string()).default([]),
  blockedHostGroups: z.array(z.string()).default([]),
  autoCreateTickets: z.boolean().default(true),
  defaultPriority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  ticketPrefix: z.string().default('[ZABBIX]')
});

export const zabbixWebhookSchema = z.object({
  eventid: z.string(),
  eventtype: z.string(),
  severity: z.number().min(0).max(5),
  status: z.string(),
  trigger: z.object({
    name: z.string(),
    severity: z.number()
  }).optional(),
  host: z.object({
    name: z.string(),
    groups: z.array(z.string())
  }).optional(),
  item: z.object({
    name: z.string()
  }).optional()
});
```

---

## 🛣️ **ROTAS**

### 🗺️ ZabbixRoutes

```typescript
// src/routes/zabbixRoutes.ts

import { Router } from 'express';
import { ZabbixServerController } from '../controllers/zabbixServerController';
import { ZabbixWebhookController } from '../controllers/zabbixWebhookController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const serverController = new ZabbixServerController();
const webhookController = new ZabbixWebhookController();

// Rotas protegidas para gerenciamento de servidores
router.use('/providers/:providerId/zabbix-servers', authMiddleware);
router.post('/providers/:providerId/zabbix-servers', serverController.createServer);
router.get('/providers/:providerId/zabbix-servers', serverController.listServers);

router.use('/zabbix-servers/:id', authMiddleware);
router.get('/zabbix-servers/:id', serverController.getServer);
router.put('/zabbix-servers/:id', serverController.updateServer);
router.delete('/zabbix-servers/:id', serverController.deleteServer);
router.post('/zabbix-servers/:id/test-connection', serverController.testConnection);
router.get('/zabbix-servers/:id/config', serverController.getConfig);
router.put('/zabbix-servers/:id/config', serverController.updateConfig);

// Rotas públicas para webhooks (sem autenticação)
router.post('/webhooks/zabbix/:serverId', webhookController.receiveEvent);

// Rotas protegidas para gerenciamento de eventos
router.use('/webhooks/zabbix/:serverId', authMiddleware);
router.get('/webhooks/zabbix/:serverId/events', webhookController.listEvents);
router.post('/webhooks/zabbix/:serverId/events/:eventId/reprocess', webhookController.reprocessEvent);
router.get('/webhooks/zabbix/:serverId/stats', webhookController.getStats);

export default router;
```

---

## ⚙️ **CONFIGURAÇÃO DO ZABBIX**

### 🔗 Configuração de Webhook no Zabbix

#### 1. **Criar Media Type no Zabbix**

```javascript
// Zabbix Administration → Media types → Create media type

Name: Sistema Gerenciamento Provedores
Type: Webhook
Parameters:
- eventid: {EVENT.ID}
- eventtype: trigger
- severity: {EVENT.SEVERITY}
- status: {EVENT.STATUS}
- trigger_name: {TRIGGER.NAME}
- trigger_severity: {TRIGGER.SEVERITY}
- host_name: {HOST.NAME}
- host_groups: {HOST.GROUPS}
- item_name: {ITEM.NAME}
- event_date: {EVENT.DATE}
- event_time: {EVENT.TIME}

Script:
var req = new HttpRequest();
req.addHeader('Content-Type: application/json');

var payload = {
    eventid: params.eventid,
    eventtype: params.eventtype,
    severity: parseInt(params.severity),
    status: params.status,
    trigger: {
        name: params.trigger_name,
        severity: parseInt(params.trigger_severity)
    },
    host: {
        name: params.host_name,
        groups: params.host_groups.split(',')
    },
    item: {
        name: params.item_name
    },
    timestamp: params.event_date + ' ' + params.event_time
};

var response = req.post('https://seu-dominio.com/api/webhooks/zabbix/{SERVIDOR_ID}', JSON.stringify(payload));

if (response !== null) {
    Zabbix.log(4, 'Webhook response: ' + response);
}

return response;
```

#### 2. **Configurar Action no Zabbix**

```
Name: Criar Ticket - Sistema Gerenciamento
Conditions:
- Trigger severity >= Warning
- Host group matches: (grupos desejados)

Operations:
- Send message via: Sistema Gerenciamento Provedores
- Send to users: (usuário configurado)
```

---

## 🔄 **FLUXO DE INTEGRAÇÃO**

### 📊 Diagrama de Fluxo

```
1. [Zabbix] Evento/Trigger disparado
           ↓
2. [Zabbix] Webhook enviado para API
           ↓
3. [API] Recebe webhook no endpoint
           ↓
4. [API] Valida payload e identifica servidor
           ↓
5. [API] Consulta configurações do servidor
           ↓
6. [API] Aplica filtros (severidade, grupos, etc.)
           ↓
7. [API] Cria ticket automaticamente (se configurado)
           ↓
8. [API] Registra evento no log
           ↓
9. [Sistema] Ticket disponível no dashboard
```

### 🎯 Exemplo de Payload Recebido

```json
{
  "eventid": "12345",
  "eventtype": "trigger",
  "severity": 3,
  "status": "PROBLEM",
  "trigger": {
    "name": "High CPU usage on server",
    "severity": 3
  },
  "host": {
    "name": "web-server-01",
    "groups": ["Linux servers", "Web servers"]
  },
  "item": {
    "name": "CPU utilization"
  },
  "timestamp": "2025-01-15 14:30:25"
}
```

### 🎫 Ticket Criado Automaticamente

```json
{
  "title": "[ZABBIX] High CPU usage on server - web-server-01",
  "description": "Evento Zabbix detectado:\n\nServidor: web-server-01\nTrigger: High CPU usage on server\nSeveridade: High\nStatus: PROBLEM\nGrupos: Linux servers, Web servers\nItem: CPU utilization\nData/Hora: 2025-01-15 14:30:25\n\nEvento ID: 12345",
  "priority": "high",
  "status": "open",
  "source": "zabbix",
  "providerId": 1
}
```

---

## 🚀 **IMPLEMENTAÇÃO PASSO A PASSO**

### 📋 Fase 1: Preparação do Banco

```bash
# 1. Adicionar models ao schema.prisma
# 2. Gerar migration
npx prisma migrate dev --name add_zabbix_integration

# 3. Gerar cliente Prisma
npx prisma generate
```

### 📋 Fase 2: Implementar Services

```typescript
// 1. ZabbixServerService
// 2. ZabbixEventService  
// 3. ZabbixRepository
// 4. Validadores
```

### 📋 Fase 3: Implementar Controllers

```typescript
// 1. ZabbixServerController
// 2. ZabbixWebhookController
// 3. Rotas
// 4. Middlewares específicos
```

### 📋 Fase 4: Configurar Zabbix

```
1. Criar Media Type
2. Configurar Actions
3. Testar webhook
4. Configurar usuários/grupos
```

---

## 🔒 **SEGURANÇA E AUTENTICAÇÃO**

### 🛡️ Medidas de Segurança

#### **Webhook Endpoint**
- **Rate Limiting**: Máximo 100 requests/minuto por servidor
- **Validação de IP**: Lista de IPs permitidos por servidor
- **Token de Verificação**: Token único por servidor Zabbix
- **Validação de Payload**: Schema Zod rigoroso

#### **Dados Sensíveis**
- **Senhas Criptografadas**: bcrypt para senhas de API
- **Tokens Seguros**: Geração automática de tokens únicos
- **Logs Auditoria**: Registro de todos os acessos e modificações

### 🔐 Exemplo de Configuração Segura

```typescript
// Middleware de segurança para webhooks
export const zabbixWebhookSecurity = async (req: Request, res: Response, next: NextFunction) => {
  const serverId = req.params.serverId;
  const clientIP = req.ip;
  const authToken = req.headers['x-zabbix-token'];
  
  // Validar servidor existe e está ativo
  const server = await ZabbixServerRepository.findById(serverId);
  if (!server || !server.isActive) {
    return res.status(404).json({ error: 'Servidor não encontrado' });
  }
  
  // Validar IP (se configurado)
  if (server.allowedIPs && !server.allowedIPs.includes(clientIP)) {
    return res.status(403).json({ error: 'IP não autorizado' });
  }
  
  // Validar token (se configurado)
  if (server.webhookToken && authToken !== server.webhookToken) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  req.zabbixServer = server;
  next();
};
```

---

## 📊 **MONITORAMENTO E LOGS**

### 📈 Métricas Importantes

- **Eventos Recebidos**: Total por servidor/período
- **Tickets Criados**: Automáticos vs manuais
- **Taxa de Sucesso**: Eventos processados com sucesso
- **Tempo de Resposta**: Latência do webhook
- **Erros**: Falhas de processamento

### 📝 Estrutura de Logs

```typescript
// Log de evento processado
{
  timestamp: "2025-01-15T14:30:25.123Z",
  level: "info",
  message: "Evento Zabbix processado com sucesso",
  data: {
    serverId: 1,
    eventId: "12345",
    ticketCreated: true,
    ticketId: 456,
    processingTime: "125ms"
  }
}

// Log de erro
{
  timestamp: "2025-01-15T14:35:10.456Z",
  level: "error", 
  message: "Falha ao processar evento Zabbix",
  data: {
    serverId: 1,
    eventId: "12346",
    error: "Severidade não mapeada: 6",
    payload: { /* payload completo */ }
  }
}
```

---

## 🧪 **TESTES E VALIDAÇÃO**

### 🔬 Cenários de Teste

#### **Teste de Webhook**
```bash
# Simular evento Zabbix
curl -X POST http://localhost:4000/api/webhooks/zabbix/1 \
  -H "Content-Type: application/json" \
  -H "X-Zabbix-Token: seu-token-aqui" \
  -d '{
    "eventid": "test-123",
    "eventtype": "trigger",
    "severity": 3,
    "status": "PROBLEM",
    "trigger": {
      "name": "Test trigger",
      "severity": 3
    },
    "host": {
      "name": "test-host",
      "groups": ["Test group"]
    }
  }'
```

#### **Teste de Configuração**
```bash
# Testar conexão com servidor Zabbix
curl -X POST http://localhost:4000/api/zabbix-servers/1/test-connection \
  -H "Authorization: Bearer seu-jwt-token"
```

---

## 📚 **DOCUMENTAÇÃO DE API**

### 📖 Swagger/OpenAPI

```yaml
# Exemplo de documentação para endpoint de webhook
/webhooks/zabbix/{serverId}:
  post:
    summary: Receber evento do Zabbix
    description: Endpoint para receber webhooks do Zabbix e processar eventos
    parameters:
      - name: serverId
        in: path
        required: true
        schema:
          type: integer
        description: ID do servidor Zabbix cadastrado
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ZabbixWebhookPayload'
    responses:
      200:
        description: Evento processado com sucesso
      400:
        description: Payload inválido
      404:
        description: Servidor não encontrado
      500:
        description: Erro interno do servidor
```

---

## 🎯 **ROADMAP DE IMPLEMENTAÇÃO**

### 📅 Cronograma Sugerido

#### **Semana 1: Fundação**
- [ ] Criar models no Prisma
- [ ] Implementar repositories básicos
- [ ] Configurar migrations

#### **Semana 2: Core Services**
- [ ] ZabbixServerService completo
- [ ] ZabbixEventService básico
- [ ] Validadores Zod

#### **Semana 3: Controllers e API**
- [ ] ZabbixServerController
- [ ] ZabbixWebhookController
- [ ] Rotas e middlewares

#### **Semana 4: Integração e Testes**
- [ ] Configurar Zabbix
- [ ] Testes de integração
- [ ] Documentação final

---

## 🔧 **CONFIGURAÇÕES AVANÇADAS**

### ⚙️ Mapeamento de Severidade Personalizado

```json
{
  "severityMapping": {
    "0": "info",      // Not classified
    "1": "info",      // Information  
    "2": "low",       // Warning
    "3": "medium",    // Average
    "4": "high",      // High
    "5": "critical"   // Disaster
  }
}
```

### 🎛️ Filtros Avançados

```json
{
  "filters": {
    "minSeverity": 2,
    "allowedHostGroups": [
      "Servidores Críticos",
      "Infraestrutura de Rede"
    ],
    "blockedHostGroups": [
      "Servidores de Teste",
      "Desenvolvimento"
    ],
    "allowedTriggerPatterns": [
      ".*CPU.*",
      ".*Memory.*",
      ".*Disk.*"
    ],
    "blockedTriggerPatterns": [
      ".*Test.*",
      ".*Debug.*"
    ]
  }
}
```

---

## 📞 **SUPORTE E TROUBLESHOOTING**

### 🐛 Problemas Comuns

#### **Webhook não recebido**
1. Verificar URL do webhook no Zabbix
2. Confirmar que servidor está ativo
3. Validar configuração de rede/firewall
4. Verificar logs do Zabbix

#### **Ticket não criado automaticamente**
1. Verificar configuração `autoCreateTickets`
2. Validar filtros de severidade
3. Confirmar mapeamento de grupos
4. Verificar logs de erro na API

#### **Erro de autenticação**
1. Validar token do webhook
2. Verificar configuração de IPs permitidos
3. Confirmar configurações do servidor Zabbix

### 📋 Checklist de Configuração

- [ ] Servidor Zabbix cadastrado e ativo
- [ ] Configurações de integração definidas
- [ ] Media Type criado no Zabbix
- [ ] Action configurada no Zabbix
- [ ] Webhook testado e funcionando
- [ ] Filtros configurados adequadamente
- [ ] Logs de auditoria habilitados

---

*Documentação da Integração Zabbix - Sistema de Gerenciamento de Provedores*  
*Versão: 1.0 | Data: Janeiro 2025*