## O que será exibido em cada card
- `ID`, `título` e badge de `prioridade` (como hoje).
- `Atualizado em` com data/hora formatadas.
- `Provedor`: exibe `provider.name` e `provider.workspace` quando disponíveis.
- `Aberto por`: exibe `openedBy.name` e `openedBy.email` quando disponíveis; trata `openedBy: null` com fallback visual.

## Mudanças técnicas
- Tipos: expandir `KanbanItem` para incluir `provider` e `openedBy` opcionais.
- Normalização de dados: ao montar o board, preservar `provider` e `openedBy` vindos da API em `TicketsKanbanPage`.
- Renderização: atualizar `KanbanItemCard` para mostrar o bloco de metadados (`provider` e `openedBy`) em uma segunda linha, mantendo estilo e responsividade.
- Recarregamento após drag: manter a mesma normalização incluindo os novos campos.

## Implementação
1. `components/kanban/KanbanBoard.tsx`
   - Atualizar `export type KanbanItem` adicionando:
     - `provider?: { id: number; name: string; workspace?: string }`
     - `openedBy?: { id: number; name: string; email?: string } | null`
2. `pages/tickets/TicketsKanbanPage.tsx`
   - Passar a usar `KanbanBoardData` como tipo do estado `board`.
   - No `loadBoard` e no refresh pós `onDragEnd`, mapear cada item incluindo `provider` e `openedBy` diretamente do `res.data`.
   - Manter compatibilidade com `waiting_client -> pending` como já feito.
3. `components/kanban/KanbanItemCard.tsx`
   - Adicionar um `DetailsRow` abaixo do `TopRow` para mostrar:
     - `Provedor: {provider.name} ({provider.workspace})` quando existir.
     - `Aberto por: {openedBy.name} ({openedBy.email})` quando existir; se `openedBy` for `null`, exibir `—`.
   - Preservar o layout atual (styled-components, tokens do theme) com texto secundário e truncamento suave.

## Verificação
- Rodar o Kanban e checar visualmente os cards com a resposta exemplo enviada.
- Garantir que drag-and-drop continua funcionando e que o re-load mantém os novos campos.
- Validar responsividade: truncamento em telas menores e que o novo conteúdo não quebra o grid.

Confirma que posso aplicar essas mudanças?