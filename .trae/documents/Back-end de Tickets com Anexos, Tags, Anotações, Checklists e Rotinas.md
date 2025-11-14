## Objetivo
- Permitir que um ticket tenha anexos (imagem/documento), tags, anotações e checklists.
- Criar e vincular checklists a Tickets ou Ordens de Serviço.
- Implementar rotinas diárias (recorrência por dias da semana e horário) que abrem tickets automaticamente para clientes.

## Arquitetura
- Stack: Node + TypeScript, Express, Prisma, JWT+bcrypt, Swagger, ESLint, dotenv, PM2.
- Camadas: `src/controllers`, `src/services`, `src/repositories`, `src/middlewares`, `src/utils`, `src/validators`, `src/docs`.
- Armazenamento de arquivos: disco local ou S3 (config via `.env`).
- Agendador: serviço dedicado (Node-cron) rodando sob PM2.

## Modelagem (Prisma)
- `Ticket`: id, providerId, customerId, title, description, status, priority, category, source, tagsCount, attachmentsCount, createdAt...
- `Attachment`: id, ticketId, filename, originalName, mimeType, size, url, uploadedBy, isPublic, createdAt.
- `Tag`: id, name, color?
- `TicketTag`: ticketId, tagId (pivot N:N).
- `Annotation`: id, resourceType ('TICKET'|'SERVICE_ORDER'), resourceId, content, isInternal, authorId, createdAt.
- `ChecklistTemplate`: id, title, description?, type ('standard'|'routine'), createdBy, providerId.
- `ChecklistItemTemplate`: id, checklistTemplateId, title, description?, required (bool), order.
- `ChecklistLink`: id, checklistTemplateId, resourceType ('TICKET'|'SERVICE_ORDER'), resourceId, status ('pending'|'in_progress'|'completed'), progress (0–100), createdAt.
- `ChecklistInstanceItem`: id, checklistLinkId, itemTemplateId, done (bool), doneAt?, note?.
- `Routine`: id, name, enabled (bool), providerId, targetType ('ALL_CUSTOMERS'|'CUSTOMER_IDS'|'CUSTOMER_GROUP'), targetIds (JSON[]), daysOfWeek (JSON {mon..sun:bool}), time ('08:00'), timezone, createFor ('TICKET'|'SERVICE_ORDER'), templateId (ChecklistTemplate opcional), category/priority/source defaults.
- `RoutineLog`: id, routineId, runAt, result ('success'|'partial'|'error'), createdCount, errorMessage?

Observação
- Polimorfismo em Prisma: usar `resourceType` + `resourceId` nos vínculos (ChecklistLink, Annotation) para suportar Ticket/OS.

## Fluxos
- Criar Ticket com anexos e tags:
  1. `POST /tickets` com payload (title, description, priority, category, source, customerId, tags: string[]).
  2. Upload de anexos via `POST /tickets/:id/attachments` (multipart), retorna metadados.
  3. Tags: salvar/associar; criar Tag inexistente on-demand.
  4. Anotações: `POST /tickets/:id/annotations` (internas/externas).
- Checklists:
  - `POST /checklists/templates` para criar modelo e itens.
  - `POST /checklists/link` para vincular template a `resourceType` + `resourceId`.
  - `GET /checklists/:linkId` para obter progresso; `PATCH /checklists/:linkId/items/:itemId` para marcar done.
- Rotinas:
  - `POST /routines` define recorrência (dias, hora, timezone, alvos, defaults).
  - Serviço `SchedulerService` verifica rotinas habilitadas e agenda jobs diários às 08:00 no timezone; cria tickets/OS para cada cliente alvo; vincula checklist quando `templateId` existir; registra em `RoutineLog`.

## Endpoints (Swagger)
- Tickets: `POST /tickets`, `GET /tickets/:id`, `POST /tickets/:id/attachments`, `POST /tickets/:id/tags`, `POST /tickets/:id/annotations`.
- Checklists: `POST /checklists/templates`, `GET /checklists/templates/:id`, `POST /checklists/link`, `GET /checklists/:linkId`, `PATCH /checklists/:linkId/items/:itemId`.
- Rotinas: `POST /routines`, `GET /routines`, `GET /routines/:id`, `PATCH /routines/:id` (enable/disable, edição), `POST /routines/:id/test-run`, `GET /routines/:id/logs`.

## Validações
- Zod/Joi nos `validators`: tipos, enums, tamanho do arquivo, MIME permitido (imagens: png/jpeg/webp; docs: pdf/docx/xlsx).
- Regras: `source` aceitando: manual, email, phone, chat, portal, api, zabbix, mobile, social, other.
- Checklist: ao vincular, garantir existência do template e do recurso.
- Rotinas: validar `daysOfWeek` (pelo menos um true), `time` HH:mm, `timezone` suportado.

## Serviços
- `AttachmentService`: upload, validação, storage, metadados.
- `TagService`: criar/associar tags ao ticket.
- `AnnotationService`: CRUD de anotações.
- `ChecklistService`: CRUD de templates, vinculação, progresso.
- `RoutineService`: CRUD, cálculo de próxima execução, seleção de clientes alvo.
- `SchedulerService`: agendar/rodar jobs diários (node-cron), idempotência (lock por rotina), logging.

## Middlewares
- Autenticação (JWT), autorização (role/permissões), rate limiting para uploads.
- Validação de payloads.

## Configuração
- `.env`: `STORAGE_DRIVER`, `UPLOAD_DIR`, `MAX_UPLOAD_SIZE_MB`, `TIMEZONE_DEFAULT`, `CRON_ENABLED`, `CRON_TZ`.
- PM2: processos `api` e `scheduler` (separados ou único com cron interno).

## Migrações
- Adicionar tabelas acima em `prisma/schema.prisma`, gerar migrações Prisma e atualizar docs Swagger.

## Critérios de Aceite
- Ticket aceita anexos, tags e anotações.
- Checklists podem ser criados e vinculados a Ticket/OS e ter progresso.
- Rotina diária cria tickets às 08:00 nos dias configurados, com log e idempotência.

Confirma esse plano para iniciar a implementação?