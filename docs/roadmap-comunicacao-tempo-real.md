# Roadmap — Comunicação em Tempo Real, WhatsApp/Telegram e IA (Fase 3)

Este documento detalha o plano para implementar chat em tempo real com clientes, integrações com WhatsApp (Evolution API, WaTicket ou WhatsApp Cloud API), Telegram, widget para site da empresa e recursos de IA opcional (prioridade de tickets e previsão de falhas).

## Objetivos
- Entregar chat em tempo real (web) com persistência, anexos e presença.
- Integrar canais externos (WhatsApp e Telegram) via webhooks e workers.
- Disponibilizar widget embutível para o site da empresa.
- Implementar observabilidade, segurança e escalabilidade.
- Adicionar IA opcional para priorização de tickets e previsão de falhas.

## Arquitetura
- Backend atual (Express + Prisma + Postgres) com incrementos:
  - Tempo real: WebSocket com Socket.IO.
  - Cache/Fila: Redis + BullMQ para processamento assíncrono.
  - Storage: S3 compatível (MinIO/local) para anexos.
  - Observabilidade: logs estruturados, métricas Prometheus, tracing OpenTelemetry.
- Modelagem (alto nível / Prisma):
  - Channel, IntegrationAccount, Conversation, Participant, Message, Attachment, WebhookEvent, OutboundQueue.

## Endpoints e Eventos (base)
- REST
  - `GET /chat/conversations`, `POST /chat/conversations`
  - `GET /chat/conversations/:id/messages`
  - `POST /chat/messages` (texto/mídia)
- Webhooks
  - WhatsApp: `POST /integrations/whatsapp/webhook`
  - Telegram: `POST /integrations/telegram/webhook`
- Outbound
  - WhatsApp: `POST /integrations/whatsapp/messages`
  - Telegram: `POST /integrations/telegram/messages`
- Socket.IO
  - `conversation:join`, `conversation:leave`, `message:new`, `message:delivered`, `message:read`, `typing`, `presence`

## Variáveis de Ambiente
- `WHATSAPP_BASE_URL`, `WHATSAPP_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `CHAT_WEBHOOK_SECRET`
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`

## Plano por Fases e Checklist

### Fase 3.1 — Fundamentos de Comunicação
- [x] Definir requisitos funcionais e SLAs do chat.
- [x] Atualizar `docker-compose.yml` para incluir `worker` (BullMQ) e MinIO (opcional).
- [x] Criar modelos Prisma: Channel, IntegrationAccount, Conversation, Participant, Message, Attachment, WebhookEvent, OutboundQueue.
 - [x] Autenticação do WebSocket via JWT (namespaces por provider/tenant).

#### Requisitos Funcionais e SLAs do Chat

- Funcionalidades
  - Mensagens em tempo real com confirmações: `queued`, `sent`, `delivered`, `read`.
  - Presença e `typing` por conversa; histórico persistente e busca básica.
  - Suporte a anexos (imagem, PDF, texto) com limites e validações.
  - Conversas 1:1 e por grupo, isolamento por `provider` (tenant).
  - Integração de canais externos (WhatsApp/Telegram) via webhooks + workers.
  - Auditoria: idempotência de webhooks, rastreabilidade de mensagens/eventos.

- Requisitos não-funcionais
  - Segurança: JWT, CORS, redaction de PII e políticas de retenção.
  - Observabilidade: logs estruturados, métricas (latência, erros, filas), tracing.
  - Escalabilidade: Redis + BullMQ; horizontalização de worker e WebSockets.

- SLAs (ambiente de produção, mesma região)
  - Latência de entrega (WS): p50 ≤ 250 ms; p95 ≤ 800 ms.
  - Criação/consulta de mensagens (REST): p95 ≤ 500 ms.
  - Disponibilidade mensal do núcleo de chat: ≥ 99.9%.
  - Enfileiramento outbound (WhatsApp/Telegram): tempo médio na fila ≤ 5 s.
  - Retries outbound: até 5 tentativas com backoff exponencial (máx. 2 min).
  - Retenção: mensagens ≥ 30 dias; anexos ≥ 90 dias (configurável).

### Fase 3.2 — Chat Interno (Web)
- [x] Implementar endpoints REST de conversas e mensagens.
- [x] Implementar eventos Socket.IO (join, new, delivered, read, typing, presence).
- [x] Upload de anexos com S3/MinIO e validação básica de arquivos.
- [x] Página interna de chat no frontend (lista, histórico e envio).

### Fase 3.3 — Integração WhatsApp
- [x] Escolher provedor principal (Evolution API como padrão; WaTicket opcional) e documentar riscos/compliance.
- [x] Webhook receiver e normalização de payload para `Message`.
- [x] Worker BullMQ para envio outbound, retries e DLQ.
- [x] Suporte a mídia: download, armazenamento, expurgo.

### Fase 3.4 — Integração Telegram
- [x] Registrar webhook do bot; mapear `chat_id` para `Conversation`.
- [x] Implementar envio/recebimento de mensagens e anexos.

### Fase 3.5 — Widget para Site
- [x] Implementar `chat-widget.js` (Vite) com configuração via `data-*`.
- [x] Endpoint `GET /chat/widget-config` para bootstrap.
- [x] CORS, rate limiting e fallback SSE.

### Fase 3.6 — IA Opcional
- [x] Sugestão de prioridade de tickets (baseline heurístico; evolução para ML offline). Endpoint: `POST /api/ai/analyze-ticket`.
- [x] Previsão de falhas (correlação de eventos e histórico; baseline inicial). Endpoint: `GET /api/ai/predict-failures/:providerId`.

### Fase 3.7 — Observabilidade e Segurança
- [x] Logs estruturados e redaction de PII (winston + auditMiddleware com redaction de campos sensíveis).
- [x] Métricas (latência, entregas, erros, filas) via Prometheus. Endpoint: `GET /metrics`.
- [x] Tracing distribuído (OpenTelemetry) habilitado via `OTEL_ENABLED=true` e exportador OTLP.
- [x] LGPD/GDPR: retenção configurável (worker de expurgo de mídia), consentimento e DSRs. Endpoints: `POST /api/privacy/consent`, `POST /api/privacy/request-erasure`.
- [x] Backups e políticas de expurgo (worker de backup com retenção). Config: `BACKUP_ENABLED`, `BACKUP_INTERVAL_MS`, `BACKUP_RETENTION_DAYS`.

## Entregáveis
- Chat em tempo real funcional (envio/recebimento, presença, typing, anexos).
- WhatsApp/Telegram inbound/outbound com status e mídia.
- Widget instalável via `<script>` com personalização básica.
- Observabilidade ativa e segurança aplicada.

## Riscos e Mitigações
- WhatsApp não-oficial: considerar Cloud API (Meta) para produção.
- Entrega de mídia: limites, tipos suportados e expurgo periódico.
- Escala: sharding de Redis e horizontalização do worker; balanceamento de WebSockets.

## Próximos Passos
- [x] Decidir provedor WhatsApp principal (Evolution API, WaTicket ou Cloud API).
  - Decisão: utilizar `Evolution API` como provedor principal em desenvolvimento/staging, com plano de fallback para `Cloud API (Meta)` em produção quando necessário (evitar banimentos e garantir conformidade).
  - Justificativa: modelo de eventos simples, webhooks robustos, menor atrito de integração inicial; Cloud API permanece opção para números oficiais e compliance; WaTicket avaliado como alternativa secundária.
  - Configuração: defina `WHATSAPP_PROVIDER=evolution` no backend.
- [x] Iniciar Fase 3.3 — WhatsApp: webhook receiver e normalização de payload.
  - Endpoints: `POST /api/integrations/webhooks/whatsapp/evolution` e `POST /api/integrations/webhooks/whatsapp/waticket` (rota disponível para WaTicket).
  - Normalização: `backend/src/integrations/whatsapp/normalizers.ts` e processamento: `backend/src/services/integrationProcessingService.ts`.
  - Worker: `WEBHOOK_PROCESSOR_ENABLED=true` com ciclo configurável via `WEBHOOK_PROCESSOR_INTERVAL_MS`.
- [x] Implementar worker BullMQ para outbound, retries e DLQ.
  - Fila: `outbound` com `attempts=5` e `backoff` exponencial; DLQ: `outbound_dlq`.
  - Habilitar: `OUTBOUND_BULLMQ_ENABLED=true` e `REDIS_URL` (e credenciais quando necessário).
  - Arquivos: `backend/src/queues/outboundQueue.ts` e `backend/src/workers/outboundBullWorker.ts`.
- [x] Definir política de mídia (download, armazenamento, expurgo).
  - Download inbound: `MEDIA_DOWNLOAD_ENABLED=true` salva em MinIO/S3 (`S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`).
  - Expurgo: `MEDIA_PURGE_ENABLED=true` com retenção `MEDIA_RETENTION_DAYS` e intervalo `MEDIA_PURGE_INTERVAL_MS`.
  - Implementação: `backend/src/services/storageService.ts` e `backend/src/workers/mediaPurge.ts`.