## Problema
- `Cannot access 'selectedProviderId' before initialization` em `TicketsListPage.tsx` porque o novo `useEffect` que usa `selectedProviderId` ficou acima da linha onde `selectedProviderId` é declarado.

## Correção
- Reordenar o código: garantir que `const { selectedProviderId } = useProviderContext();` esteja declarado antes do `useEffect` que usa este valor.
- Mover o listener `useEffect` de `ticket-created` para logo após a declaração de `selectedProviderId`.

## Implementação
1) Remover o `useEffect` recém-adicionado que está acima da declaração de `selectedProviderId`.
2) Adicionar o mesmo `useEffect` logo abaixo de `const { selectedProviderId } = useProviderContext();`:
   - Listener de `ticket-created` -> se provider do evento corresponde ou contexto é global, chama `loadTickets()`.

## Verificação
- Página `/tickets` carrega sem erro.
- Criar ticket abre modal e a lista é atualizada automaticamente.

Posso aplicar a correção agora?