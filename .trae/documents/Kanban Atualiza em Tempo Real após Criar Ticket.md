## Problema
- Após criar um ticket, o Kanban não atualiza imediatamente; só recarrega ao atualizar a página.
- Há risco de violar as Rules of Hooks no emissor do evento do modal.

## Causas Prováveis
- Emissão do evento `ticket-created` sem garantir que o provider atual seja capturado corretamente (hook sendo chamado dentro de handler).
- Fetch do Kanban usando resposta cacheada; o listener chama `loadBoard()` sem cache-buster.
- Ordem dos hooks/listeners em `/tickets` já ajustada, mas falta robustez similar no Kanban.

## Correções Propostas
### 1) Corrigir emissão do evento no modal
- Arquivo: `src/contexts/ticketCreateModalContext.tsx`
- Mover `const { selectedProviderId } = useProviderContext()` para o topo do componente `TicketCreateModalProvider` e usar a variável no `handleSubmit` (remover hook dentro do handler). Isso segue as Rules of Hooks: hooks apenas no topo do componente ou de hooks personalizados.
- Emitir `window.dispatchEvent(new CustomEvent('ticket-created', { detail: { id, providerId: selectedProviderId ?? null } }))` após sucesso.

### 2) Tornar o Kanban à prova de cache
- Arquivo: `src/pages/tickets/TicketsKanbanPage.tsx`
- Refatorar `loadBoard(force?: boolean)` para adicionar `&t=${Date.now()}` (cache-buster) quando `force` for true.
- Listener do `ticket-created` chamar `loadBoard(true)`.
- Adicionar um `setTimeout(() => loadBoard(true), 300-500ms)` no listener como fallback para bancos/transactions mais lentos.

### 3) Opcional: Atualização otimista
- No listener do Kanban, antes do fetch, empurrar um card provisório na coluna `open` com os dados mínimos (id, título “Ticket recém-criado”, priority “medium”) e substituí-lo após o fetch.
- Simples e melhora percepção; porém, se preferir evitar estado provisório, manter apenas a recarga com cache-buster.

### 4) Verificar ordem dos hooks
- Garantir que `selectedProviderId` e `loadBoard` sejam declarados antes dos `useEffect` que dependem deles.
- Padrão já aplicado em `/tickets`; replicar consistência no Kanban.

## Verificação
- Criar ticket pelo modal estando em `/tickets/kanban`: cartão novo aparece sem reload (após fetch com cache-buster).
- Em `/tickets`: lista recarrega automaticamente.
- Em `/dashboard`: KPIs/recentes atualizam com o ticket criado.

Posso aplicar as mudanças acima agora para deixar o Kanban e demais páginas atualizando em tempo real com segurança?