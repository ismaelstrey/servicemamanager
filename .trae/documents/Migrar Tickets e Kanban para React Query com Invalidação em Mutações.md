## Objetivo
- Garantir atualização em tempo real após criar um ticket, sem recarregar a página, usando React Query.

## Problemas Atuais
- O evento `ticket-created` dispara recarregamentos manuais, mas as páginas usam estado local (não React Query), então `invalidateQueries` não tem efeito nelas.
- O Kanban só atualiza com `loadBoard(true)` manual e pode ser impactado por cache.

## Solução
### 1) Hook de criação de ticket
- Já adicionar `useQueryClient` e `onSuccess` no `useTickets.createTicket` para invalidar:
  - `['tickets']`, `['tickets-kanban']`, `['dashboard']`.
- Manter evento `ticket-created` como fallback.

### 2) Tickets Lista (`/tickets`) com React Query
- Substituir o fetch manual por `useQuery`:
  - `queryKey: ['tickets', { providerId, page, filters }]`.
  - `queryFn`: chama API (`getTicketsAll` ou `getTickets(providerId)`), normaliza statuses e retorna `{ items, total }`.
  - `keepPreviousData: true` para paginação suave.
- Remover `loadTickets` e os estados `loading`, `error`, `tickets`, `totalItems` (derivar da query).
- Listener `ticket-created` passa a fazer `queryClient.invalidateQueries({ queryKey: ['tickets'] })`.

### 3) Tickets Kanban (`/tickets/kanban`) com React Query
- Substituir o fetch manual por `useQuery`:
  - `queryKey: ['tickets-kanban', { providerId }]`.
  - `queryFn`: chama API, normaliza e retorna `KanbanBoard` completo.
  - `staleTime: 60s`, `keepPreviousData: true`.
- Remover `loadBoard`, `board`/`loading` locais; usar `data` e `isLoading` da query.
- Em `onDragEnd`: após `ApiService.put('/tickets/:id/status')`, chamar `queryClient.invalidateQueries({ queryKey: ['tickets-kanban'] })`.
- Listener `ticket-created`: `invalidateQueries(['tickets-kanban'])`.

### 4) Dashboard (opcional nesta etapa)
- Manter listener atual `ticket-created` que chama `loadDashboardData`. (Migração para React Query pode ficar como próximo passo.)

### 5) Regras de Hooks
- Garantir que `useQueryClient`, `useQuery` e hooks de contexto sejam chamados no topo dos componentes.
- Remover qualquer chamada de hook dentro de handlers para evitar “Invalid hook call”.

## Verificação
- Criar ticket pelo modal em cada página:
  - Lista: aparece sem reload.
  - Kanban: novo card aparece após invalidar e refetch automático.
  - Dashboard: KPIs/listas recentes atualizam via listener atual.

Posso aplicar a migração e ajustes descritos acima agora?