# Integrações

Integrações de comunicação e serviços externos.

## WhatsApp
- Provedor principal: Evolution API (`WHATSAPP_PROVIDER=evolution`).
- Fallback: Cloud API (Meta).
- Webhooks: `/api/integrations/whatsapp/evolution`, `/api/integrations/whatsapp/watiicket`.

## Telegram
- Envio outbound via `OutboundSendService`.

## Storage de Mídia
- MinIO/S3 com `S3_*` envs.