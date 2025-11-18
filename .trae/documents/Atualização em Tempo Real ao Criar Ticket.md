## Objetivo
- Ao criar um ticket pelo modal, atualizar automaticamente os dados nas páginas atuais:
  - `/tickets` (lista)
  - `/tickets/kanban` (kanban)
  - `/dashboard` (KPIs e recentes)

## Estratégia
- Usar um evento global de aplicativo disparado no sucesso da criação do ticket.
- Cada página escuta esse evento e refaz seu fetch com as funções já existentes (carregamento atual) para manter consistência.

## Implementação
### 1) Disparar evento global no sucesso do modal
- Arquivo: `src/contexts/ticketCreateModalContext.tsx`
- Após criar com sucesso, emitir:
  - `window.dispatchEvent(new CustomEvent('ticket-created', { detail: { id: ticket.id, providerId: selectedProviderId ?? null } }))`
- Justificativa: páginas podem decidir se atualizam baseado no contexto (global ou provider selecionado).

### 2) Tickets List (`/tickets`)
- Arquivo: `src/pages/tickets/TicketsListPage.tsx`
- Adicionar `useEffect` para ouvir `ticket-created`:
  - Se `selectedProviderId == null` (global) ou `detail.providerId == selectedProviderId`, chamar `loadTickets()`.
- Opcional: Mostrar toast “Ticket criado” (reaproveitar `Alert` já existente se desejado).

### 3) Tickets Kanban (`/tickets/kanban`)
- Arquivo: `src/pages/tickets/TicketsKanbanPage.tsx`
- Extrair a lógica de fetch para uma função `loadBoard()` reutilizável.
- Adicionar `useEffect` para ouvir `ticket-created`:
  - Se o provider do evento corresponder ao contexto atual (ou for global), chamar `loadBoard()`.
- Observação: O backend deve retornar o novo ticket como `open`; a recarga sincroniza corretamente.

### 4) Dashboard
- Arquivo: `src/pages/dashboard.tsx`
- Adicionar `useEffect` para ouvir `ticket-created` e chamar `loadDashboardData()` com o contexto atual.
- Atualiza KPIs e listas recentes automaticamente.

### 5) Compatibilidade e Regras de Hooks
- Garantir que listeners sejam registrados dentro de `useEffect` no corpo do componente e removidos no cleanup, alinhado às regras oficiais de Hooks.
- Não chamar hooks fora de componentes (evitar o erro invalid hook call).

## Verificação
- Criar ticket pelo modal em cada página e confirmar atualização automática:
  - Lista: novo item aparece sem reload.
  - Kanban: novo cartão em coluna “open” após recarga do board.
  - Dashboard: KPIs e recentes se atualizam.

## Arquivos Envolvidos
- `src/contexts/ticketCreateModalContext.tsx`
- `src/pages/tickets/TicketsListPage.tsx`
- `src/pages/tickets/TicketsKanbanPage.tsx`
- `src/pages/dashboard.tsx`

Posso aplicar essas alterações agora?