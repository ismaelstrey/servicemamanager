## Objetivo
- Tornar o toast do Kanban automático (fecha sozinho) após atualizar status ou criar ticket, padronizando com o modal.

## Implementação
- `src/pages/tickets/TicketsKanbanPage.tsx`:
  - Adicionar um `useEffect` que observa `toastOpen` e agenda `setToastOpen(false)` com `setTimeout` (~1500 ms).
  - Limpar o timeout no cleanup para evitar vazamentos.

## Verificação
- Alterar status no Kanban: toast aparece e fecha sozinho.
- Criar ticket: toast de sucesso/erro no Kanban também fecha automaticamente.

Posso aplicar agora?