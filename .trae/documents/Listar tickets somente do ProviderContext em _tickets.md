## Objetivo
Em `/tickets`, carregar e exibir apenas tickets do provedor selecionado no `ProviderContext`.

## Onde alterar
- `frontend/src/pages/tickets/TicketsListPage.tsx`

## Implementação
1. Importar `useProviderContext` e ler `selectedProviderId` do contexto.
2. Remover o uso de `user?.providerId` e o caminho de "global" (`getTicketsAll`), passando a usar sempre `TicketService.getTickets(selectedProviderId, ...)` quando houver `selectedProviderId`.
3. Quando `selectedProviderId` estiver ausente (null), não chamar a API e exibir um aviso amigável (e lista vazia) sugerindo selecionar um provedor.
4. Manter filtros, paginação e exportações; apenas a fonte de dados passa a ser o provedor do contexto.
5. Efeito de recarregamento: incluir `selectedProviderId` nas dependências do `loadTickets` e do `useEffect` para atualizar a lista ao trocar de provedor.

## Validação
- Selecionar diferentes provedores no contexto e confirmar que `/tickets` altera a listagem.
- Verificar estados sem provedor: exibir alerta e nenhum ticket carregado.
- Build sem erros.

Posso aplicar essas alterações agora?