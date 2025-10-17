# 🔗 Especificação de Endpoints - Integração Zabbix

## 📋 **VISÃO GERAL**

Esta documentação detalha todos os endpoints necessários para a integração completa com Zabbix, incluindo gerenciamento de servidores, configurações, webhooks e eventos.

---

## 🛡️ **AUTENTICAÇÃO**

Todos os endpoints protegidos requerem:
```http
Authorization: Bearer <jwt_token>
```

Endpoints públicos (webhooks) usam token único por servidor:
```http
X-Webhook-Token: <server_webhook_token>
```

---

## 🖥️ **GERENCIAMENTO DE SERVIDORES ZABBIX**

### 📝 **POST /api/providers/:providerId/zabbix-servers**
Cadastra um novo servidor Zabbix para o provedor.

#### Request
```http
POST /api/providers/1/zabbix-servers
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "name": "Zabbix Provedor ABC",
  "url": "https://zabbix.provedorabc.com",
  "version": "6.4.0",
  "apiToken": "abc123token456",
  "username": "api_user",
  "password": "senha_segura",
  "isActive": true
}
```

#### Response Success (201)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Zabbix Provedor ABC",
    "url": "https://zabbix.provedorabc.com",
    "version": "6.4.0",
    "webhookToken": "whk_abc123def456ghi789",
    "isActive": true,
    "providerId": 1,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  },
  "webhookUrl": "https://api.seudominio.com/api/webhooks/zabbix/whk_abc123def456ghi789"
}
```

#### Validação Zod
```typescript
const createZabbixServerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  url: z.string().url().refine(url => url.startsWith('http'), {
    message: 'URL deve começar com http ou https'
  }),
  version: z.string().optional(),
  apiToken: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  isActive: z.boolean().default(true)
}).refine(data => data.apiToken || (data.username && data.password), {
  message: 'Deve fornecer apiToken OU username+password'
});
```

---

### 📋 **GET /api/providers/:providerId/zabbix-servers**
Lista todos os servidores Zabbix do provedor.

#### Request
```http
GET /api/providers/1/zabbix-servers?page=1&limit=10&active=true
Authorization: Bearer <jwt_token>
```

#### Response Success (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Zabbix Provedor ABC",
      "url": "https://zabbix.provedorabc.com",
      "version": "6.4.0",
      "isActive": true,
      "lastSync": "2025-01-15T09:45:00Z",
      "eventsCount": 156,
      "ticketsCreated": 23,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 🔍 **GET /api/zabbix-servers/:id**
Obtém detalhes completos de um servidor Zabbix.

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Zabbix Provedor ABC",
    "url": "https://zabbix.provedorabc.com",
    "version": "6.4.0",
    "webhookToken": "whk_abc123def456ghi789",
    "isActive": true,
    "lastSync": "2025-01-15T09:45:00Z",
    "provider": {
      "id": 1,
      "name": "Provedor ABC",
      "workspace": "provedor-abc"
    },
    "config": {
      "autoCreateTickets": true,
      "minSeverity": 2,
      "defaultPriority": "medium",
      "ticketPrefix": "[ZABBIX]"
    },
    "stats": {
      "totalEvents": 156,
      "processedEvents": 150,
      "ticketsCreated": 23,
      "lastEventTime": "2025-01-15T09:45:00Z"
    }
  }
}
```

---

### ✏️ **PUT /api/zabbix-servers/:id**
Atualiza configurações do servidor Zabbix.

#### Request
```http
PUT /api/zabbix-servers/1
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "name": "Zabbix Provedor ABC - Atualizado",
  "version": "6.4.1",
  "isActive": false
}
```

---

### 🗑️ **DELETE /api/zabbix-servers/:id**
Remove servidor Zabbix (soft delete).

#### Response Success (200)
```json
{
  "success": true,
  "message": "Servidor Zabbix removido com sucesso",
  "data": {
    "eventsArchived": 156,
    "configRemoved": true
  }
}
```

---

### 🔌 **POST /api/zabbix-servers/:id/test-connection**
Testa conectividade com o servidor Zabbix.

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "connected": true,
    "responseTime": 245,
    "version": "6.4.0",
    "apiVersion": "6.4.0",
    "hostsCount": 45,
    "triggersCount": 234,
    "testedAt": "2025-01-15T10:45:00Z"
  }
}
```

#### Response Error (400)
```json
{
  "success": false,
  "error": {
    "code": "CONNECTION_FAILED",
    "message": "Não foi possível conectar ao servidor Zabbix",
    "details": {
      "url": "https://zabbix.provedorabc.com",
      "error": "Connection timeout",
      "testedAt": "2025-01-15T10:45:00Z"
    }
  }
}
```

---

## ⚙️ **CONFIGURAÇÕES ZABBIX**

### 📋 **GET /api/zabbix-servers/:id/config**
Obtém configurações do servidor Zabbix.

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "enabledTriggers": true,
    "enabledHosts": true,
    "enabledItems": false,
    "severityMapping": {
      "0": "info",
      "1": "info", 
      "2": "low",
      "3": "medium",
      "4": "high",
      "5": "critical"
    },
    "minSeverity": 2,
    "allowedHostGroups": ["Servidores", "Switches"],
    "blockedHostGroups": ["Teste"],
    "allowedTriggerTags": ["production"],
    "blockedTriggerTags": ["maintenance"],
    "autoCreateTickets": true,
    "defaultPriority": "medium",
    "ticketPrefix": "[ZABBIX]",
    "ticketTemplate": "{trigger.name} em {host.name}"
  }
}
```

---

### ✏️ **PUT /api/zabbix-servers/:id/config**
Atualiza configurações do servidor Zabbix.

#### Request
```http
PUT /api/zabbix-servers/1/config
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "minSeverity": 3,
  "allowedHostGroups": ["Servidores", "Switches", "Roteadores"],
  "autoCreateTickets": true,
  "defaultPriority": "high",
  "ticketTemplate": "🚨 {trigger.name} - Host: {host.name} - Severidade: {trigger.severity}"
}
```

#### Validação Zod
```typescript
const updateZabbixConfigSchema = z.object({
  enabledTriggers: z.boolean().optional(),
  enabledHosts: z.boolean().optional(),
  enabledItems: z.boolean().optional(),
  severityMapping: z.record(z.enum(['info', 'low', 'medium', 'high', 'critical'])).optional(),
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
```

---

## 🔗 **WEBHOOKS ZABBIX**

### 📨 **POST /api/webhooks/zabbix/:webhookToken**
Endpoint público para receber eventos do Zabbix.

#### Request
```http
POST /api/webhooks/zabbix/whk_abc123def456ghi789
Content-Type: application/json
X-Zabbix-Webhook: true

{
  "eventid": "12345",
  "eventtype": "trigger",
  "severity": 4,
  "status": "PROBLEM",
  "trigger": {
    "name": "CPU usage > 90%",
    "severity": 4,
    "tags": ["production", "critical"]
  },
  "host": {
    "name": "srv-web-01",
    "groups": ["Servidores", "Web Servers"]
  },
  "item": {
    "name": "CPU utilization",
    "value": "95.2%"
  },
  "timestamp": "2025-01-15T10:45:30Z",
  "acknowledge": {
    "status": "unacknowledged"
  }
}
```

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "eventProcessed": true,
    "ticketCreated": true,
    "ticketId": 156,
    "eventId": "12345",
    "processedAt": "2025-01-15T10:45:31Z"
  }
}
```

#### Response - Evento Filtrado (200)
```json
{
  "success": true,
  "data": {
    "eventProcessed": true,
    "ticketCreated": false,
    "reason": "Severidade abaixo do mínimo configurado",
    "eventId": "12345",
    "processedAt": "2025-01-15T10:45:31Z"
  }
}
```

---

## 📊 **EVENTOS E ESTATÍSTICAS**

### 📋 **GET /api/zabbix-servers/:id/events**
Lista eventos recebidos do servidor Zabbix.

#### Request
```http
GET /api/zabbix-servers/1/events?page=1&limit=20&processed=true&severity=4&status=PROBLEM&dateFrom=2025-01-01&dateTo=2025-01-15
Authorization: Bearer <jwt_token>
```

#### Response Success (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "eventId": "12345",
      "eventType": "trigger",
      "severity": 4,
      "status": "PROBLEM",
      "triggerName": "CPU usage > 90%",
      "hostName": "srv-web-01",
      "hostGroups": ["Servidores", "Web Servers"],
      "eventTime": "2025-01-15T10:45:30Z",
      "processed": true,
      "ticketCreated": true,
      "ticket": {
        "id": 156,
        "title": "[ZABBIX] CPU usage > 90%",
        "status": "open",
        "priority": "high"
      },
      "createdAt": "2025-01-15T10:45:31Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  },
  "filters": {
    "processed": true,
    "severity": 4,
    "status": "PROBLEM"
  }
}
```

---

### 🔄 **POST /api/zabbix-servers/:id/events/:eventId/reprocess**
Reprocessa um evento específico.

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "eventReprocessed": true,
    "ticketCreated": true,
    "ticketId": 157,
    "reprocessedAt": "2025-01-15T11:00:00Z"
  }
}
```

---

### 📈 **GET /api/zabbix-servers/:id/stats**
Obtém estatísticas do servidor Zabbix.

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-01-01T00:00:00Z",
      "to": "2025-01-15T23:59:59Z"
    },
    "events": {
      "total": 1250,
      "processed": 1200,
      "failed": 50,
      "byStatus": {
        "PROBLEM": 800,
        "OK": 400,
        "UNKNOWN": 50
      },
      "bySeverity": {
        "0": 100,
        "1": 150,
        "2": 300,
        "3": 400,
        "4": 250,
        "5": 50
      }
    },
    "tickets": {
      "created": 180,
      "byPriority": {
        "low": 50,
        "medium": 80,
        "high": 40,
        "critical": 10
      },
      "byStatus": {
        "open": 45,
        "in_progress": 25,
        "resolved": 100,
        "closed": 10
      }
    },
    "performance": {
      "avgProcessingTime": 245,
      "successRate": 96.0,
      "lastProcessedAt": "2025-01-15T10:45:31Z"
    }
  }
}
```

---

## 🚨 **TRATAMENTO DE ERROS**

### Códigos de Erro Padrão
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos",
    "details": {
      "field": "url",
      "value": "invalid-url",
      "expected": "URL válida começando com http/https"
    }
  }
}
```

### Códigos Específicos da Integração Zabbix
- `ZABBIX_CONNECTION_FAILED` - Falha na conexão com Zabbix
- `ZABBIX_AUTH_FAILED` - Falha na autenticação
- `ZABBIX_API_ERROR` - Erro na API do Zabbix
- `WEBHOOK_TOKEN_INVALID` - Token de webhook inválido
- `EVENT_PROCESSING_FAILED` - Falha no processamento do evento
- `DUPLICATE_SERVER_NAME` - Nome do servidor já existe
- `SERVER_NOT_FOUND` - Servidor não encontrado
- `CONFIG_VALIDATION_FAILED` - Configuração inválida

---

## 🔒 **SEGURANÇA**

### Rate Limiting
```
- Endpoints protegidos: 100 req/min por usuário
- Webhooks: 1000 req/min por servidor
- Teste de conexão: 10 req/min por servidor
```

### Validações de Segurança
- Webhook tokens únicos e seguros (32 caracteres)
- Senhas criptografadas com bcrypt
- Sanitização de payloads JSON
- Validação de origem dos webhooks
- Log de todas as operações críticas

### Headers de Segurança
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---

## 📝 **LOGS E AUDITORIA**

### Eventos Logados
- Criação/atualização/remoção de servidores
- Alterações de configuração
- Eventos recebidos via webhook
- Tickets criados automaticamente
- Falhas de processamento
- Testes de conexão

### Formato de Log
```json
{
  "timestamp": "2025-01-15T10:45:31Z",
  "level": "info",
  "service": "zabbix-integration",
  "action": "webhook_received",
  "serverId": 1,
  "eventId": "12345",
  "ticketCreated": true,
  "processingTime": 245,
  "metadata": {
    "severity": 4,
    "hostName": "srv-web-01",
    "triggerName": "CPU usage > 90%"
  }
}
```

---

*Especificação de Endpoints - Integração Zabbix*  
*Versão: 1.0 | Atualizado: Janeiro 2025*