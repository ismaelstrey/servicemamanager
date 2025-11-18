## Objetivo
- Substituir o texto/badge de prioridade por um ícone sutil com cor conforme a prioridade.
- Manter visual minimalista e compatível com dark mode.

## Mudanças técnicas
1. `KanbanItemCard.tsx`
- Importar ícone `Circle` de `lucide-react`.
- Criar função `priorityColor(p: string): string` com mapeamento de cores por nível: low (verde), medium (azul), high (amber), urgent (vermelho), critical (vermelho intenso).
- No `TopRow`, substituir o `<Badge>` atual por `<Circle size={14} color={priorityColor(priority)} aria-label="Prioridade" />` ao lado do título.
- Ajustar espaçamento para manter o layout enxuto.

## Verificação
- Conferir cards com diferentes prioridades para cor correta.
- Validar que o hover/drag-and-drop permanecem estáveis.
- Verificar compatibilidade com tema escuro (as cores escolhidas têm bom contraste).

Posso aplicar essas mudanças?