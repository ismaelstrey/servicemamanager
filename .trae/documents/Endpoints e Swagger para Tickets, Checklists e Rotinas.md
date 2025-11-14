## Objetivo
- Implementar endpoints REST com Swagger para Tickets (tags, anexos, anotações), Checklists e Rotinas.
- Criar serviço de agendamento (scheduler) para rotinas diárias.
- Adicionar endpoint para obter Ticket por ID incluindo dados do Provedor.

## Endpoints
### Tickets
- POST `/api/tickets` — cria ticket (resolver `providerId` via contexto). Body: `{ title, description, priority, category, source, customerId?, equipmentId?, tags?: string[] }`.
- GET `/api/tickets/{id}` — detalha ticket e inclui `provider` (join). Resposta: `{ ticket: Ticket, provider: { id, name, workspace, cnpj? } }`.
- PATCH `/api/tickets/{id}` — atualiza ticket (campos permitidos).
- POST `/api/tickets/{id}/attachments` — upload multipart (campo `file`). Aceitar: imagens (png/jpeg/webp/svg), docs (pdf/docx/xlsx/zip, etc.).
- GET `/api/tickets/{id}/attachments` — lista anexos.
- DELETE `/api/tickets/{id}/attachments/{attachmentId}` — remove anexo.
- POST `/api/tickets/{id}/tags` — associa tags (cria se não existirem) `{ tags: string[] }`.
- GET `/api/tickets/{id}/tags` — lista tags.
- DELETE `/api/tickets/{id}/tags/{tagId}` — desassocia.
- POST `/api/tickets/{id}/annotations` — cria anotação `{ content, isInternal? }`.
- GET `/api/tickets/{id}/annotations` — lista anotações (paginações padrão).

### Checklists
- POST `/api/checklists/templates` — cria template + itens.
- GET `/api/checklists/templates/{id}` — detalha.
- PATCH `/api/checklists/templates/{id}` — atualiza.
- DELETE `/api/checklists/templates/{id}` — remove.
- POST `/api/checklists/link` — vincula template a recurso `{ checklistTemplateId, resourceType: 'TICKET'|'SERVICE_ORDER', resourceId }`.
- GET `/api/checklists/{linkId}` — progresso e itens.
- PATCH `/api/checklists/{linkId}/items/{itemId}` — marca `done`/`note`.
- DELETE `/api/checklists/{linkId}` — desvincula.

### Rotinas
- POST `/api/routines` — cria rotina (dias da semana, hora, timezone, alvo, defaults).
- GET `/api/routines` — lista (filtros: enabled, providerId).
- GET `/api/routines/{id}` — detalha.
- PATCH `/api/routines/{id}` — edita/ativar/desativar.
- POST `/api/routines/{id}/test-run` — executa uma vez e registra em `RoutineLog`.
- GET `/api/routines/{id}/logs` — lista logs.

## Swagger
- Tags: Tickets, Attachments, Tags, Annotations, Checklists, Routines.
- Schemas: `Ticket`, `ProviderSummary`, `Attachment`, `Tag`, `Annotation`, `ChecklistTemplate`, `ChecklistItem`, `ChecklistLink`, `ChecklistInstanceItem`, `Routine`, `RoutineLog`.
- RequestBodies: multipart para upload.
- Examples: sucesso/erro de validação (inclui enum `source`).

## Validações e Segurança
- JWT + roles (admin/manager/technician) e permissões por recurso.
- `source`: `manual|email|phone|chat|portal|api|zabbix|mobile|social|other`.
- Upload: MIME/tamanho máximo via `.env`, rate-limiting.
- Rotinas: `daysOfWeek` válido, `time` `HH:mm`, timezone suportado.

## Implementação (camadas)
- Controllers:
  - `ticketController`: CRUD + tags/anexos/anotações + GET com provider.
  - `checklistController`: templates, link, progresso.
  - `routineController`: CRUD, logs, test-run.
- Services:
  - `AttachmentService`, `TagService`, `AnnotationService`, `ChecklistService`, `RoutineService`.
  - `SchedulerService`: agendar execuções (node-cron/PM2), idempotência e logs.
- Repositories:
  - Prisma para cada modelo com métodos `findWithProvider(ticketId)` para o endpoint de detalhe.
- Routes:
  - `src/routes/ticketRoutes.ts`, `checklistRoutes.ts`, `routineRoutes.ts` com validators e Swagger JSDoc.
- Validators:
  - zod/joi por endpoint (create/update, upload, link, rotina).

## Entrega e Testes
- Entrega incremental: Tickets → Attachments/Tags/Annotations → Checklists → Rotinas → Scheduler.
- Testes de integração: criação de ticket com tags/anexos; vínculo de checklist; test-run de rotina e log.

## Critérios de Aceite
- Endpoints funcionais com Swagger atualizado.
- `GET /api/tickets/{id}` retorna ticket + provider.
- Uploads seguros; checklists operacionais; rotinas agendadas/test-run registram logs.

Confirma para iniciar a implementação dos endpoints e documentação?