## Objetivo
- Ajustar `GET /api/tickets/kanban` e `GET /api/providers/:providerId/tickets/kanban` para retornar, por ticket:
  - `provider` do ticket (`id`, `name`, `workspace`)
  - `openedBy` (usuário que abriu o ticket: `id`, `name`, `email`)

## Alterações de Dados
- Adicionar relação `openedBy` ao modelo `Ticket`:
  - Prisma (`backend/prisma/schema.prisma`):
    - Em `model Ticket`, incluir:
      - `openedBy   User? @relation(fields: [openedById], references: [id])`
      - `openedById Int?`
- Criar migration Prisma para adicionar coluna `opened_by_id` com FK para `user(id)`.

## Implementação de Backend
- Serviço de criação de ticket:
  - `backend/src/services/ticketService.ts:48-51`
    - Alterar assinatura de `repository.create` para receber `openedById`.
    - Passar `user.id` ao repositório para persistir `openedById`.
- Repositório de tickets:
  - `backend/src/repositories/ticketRepository.ts`
    - Alterar `create(providerId, data)` → `create(providerId, data, openedById?)` e salvar `openedById`.
    - Em `getKanbanByProvider` (`:483-516`) e `getKanbanAll` (`:519-551`):
      - Trocar `select` para incluir relações:
        - `provider: { select: { id, name, workspace } }`
        - `openedBy: { select: { id, name, email } }` (pode ser `null` para tickets antigos)
      - Montar cada item como:
        - `{ id, title, priority, updatedAt, provider: { ... }, openedBy: openedBy ? { ... } : null }`
    - Atualizar tipo `KanbanColumnItem` para incluir `provider` e `openedBy` opcionais.
- Controllers de Kanban:
  - `backend/src/controllers/ticketController.ts:470-485` e `:491-512` sem mudanças (apenas propagam o board).

## Compatibilidade com o Frontend
- O frontend atual (`frontend/src/pages/tickets/TicketsKanbanPage.tsx`) usa apenas `id`, `title`, `priority`, `updatedAt`.
- Campos adicionais são compatíveis (serão ignorados), sem quebrar tipos locais.
- Opcionalmente, podemos exibir `provider`/`openedBy` depois, mas não é necessário para esta entrega.

## Validação
- Rodar `prisma migrate dev` e `prisma generate`.
- Criar um ticket novo e verificar que `openedById` é preenchido.
- Consultar `/api/tickets/kanban` e `/api/providers/:id/tickets/kanban` e confirmar presença de `provider` e `openedBy` em cada item.

## Observações de Segurança/Cache
- Mantém `authMiddleware` e verificação de acesso já existentes.
- `cacheMiddleware` continuará funcionando; invalidado por eventos de status no serviço.

Confirma prosseguir com essas mudanças?