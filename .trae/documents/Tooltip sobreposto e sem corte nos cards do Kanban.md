## Objetivo
- Garantir que o tooltip de `openedBy` sempre sobreponha as colunas do Kanban e não seja cortado.

## Mudanças técnicas
1. `components/ui/Tooltip.tsx`
- Renderizar a bolha em um portal para `document.body` usando `createPortal`.
- Usar `position: fixed` e calcular coordenadas via `getBoundingClientRect` do wrapper.
- Manter `placement` com transform CSS e adicionar offset de 8px por direção.
- Elevar `z-index` com `theme.zIndex.tooltip` (ou valor alto) para sobreposição.

## Verificação
- Hover no capsule com iniciais no rodapé do card: tooltip aparece por cima sem corte.
- Testar em diferentes colunas e com drag-and-drop ativo.

Posso aplicar essas mudanças?