## Objetivo

Habilitar refetch automático ao recapturar foco da janela e reconexões de rede, dando sensação de realtime em toda a aplicação; garantir isso também no Kanban de Tickets.

## Alterações Globais (React Query)

* Atualizar `QueryClient` em `src/App.tsx`:

  * `refetchOnWindowFocus: true` (ou `'always'`)

  * `refetchOnReconnect: true`

  * `refetchOnMount: true`

  * Opcional leve: `staleTime: 0` e `refetchInterval: 30000` (30s) para um toque de atualização contínua; podemos aplicar por página se preferir.

## Kanban de Tickets

* Refatorar `src/pages/tickets/TicketsKanbanPage.tsx` para usar `useQuery`:

  * `queryKey: ['tickets-kanban', { providerId, priorityFilter, searchTerm }]`

  * `queryFn`: atual `ApiService.get` com normalização existente

  * `refetchOnWindowFocus: true`, `refetchOnReconnect: true`, `refetchOnMount: true`

  * No evento `ticket-created`, chamar `queryClient.invalidateQueries({ queryKey: ['tickets-kanban'] })` em vez de executar `loadBoard` manual

  * Remover `useEffect` que chama `loadBoard` direto; centralizar no `useQuery`

## Outras páginas com useQuery

* Revisar `TicketsListPage`, `useProviders`, e demais hooks/páginas com `useQuery`:

  * Remover flags conflitantes e harmonizar com globais

  * Adicionar `refetchOnWindowFocus` apenas onde há fetch manual hoje (se necessário)

## Páginas com fetch manual

* Para telas que usam `ApiService` diretamente (sem React Query), adicionar listener de `window.addEventListener('focus', ...)` para disparar reload curto e garantir atualização ao voltar o foco.

## Verificação

* Navegar para `/tickets/kanban` e `/tickets`;

* Perder foco e voltar: confirmar `refetch` no Network

* Simular reconexão offline→online: confirmar novo `refetch`

* Confirmar que eventos (`ticket-created`) invalidam e recarregam a board.

## Observação

* Mantém impacto de rede moderado; se desejar, reduzimos ou removemos `refetchInterval` global e aplicamos apenas nas telas críticas.

