## Objetivo
- Exibir apenas as iniciais do `openedBy.name` no rodapé do card (ex.: "Ismael Strey Pereira" → "IS").
- Ao passar o mouse, mostrar um tooltip com nome completo e e‑mail.
- Visual minimalista, consistente com dark mode e com animação sutil.

## Mudanças técnicas
1. Utilitário de iniciais
- Criar uma função `getInitials(name: string): string` que:
  - Divide o nome por espaços, usa primeira e última palavras.
  - Se houver apenas uma palavra, pega as duas primeiras letras.
  - Normaliza para maiúsculas e remove espaços extras.

2. Rodapé do card
- Adicionar um `FooterRow` no `KanbanItemCard` posicionando elementos em `space-between`:
  - À esquerda: data/hora com ícone `Clock` (como hoje).
  - À direita: um `AvatarCapsule` com as iniciais.

3. Tooltip do autor
- Usar `Tooltip` do pacote de UI para exibir `"Nome Completo (email)"` ao hover no `AvatarCapsule`.
- `placement="top"` para não interferir com arraste.

4. Estilo e animação
- `AvatarCapsule`: círculo discreto, usa `theme.colors.background.secondary` e `theme.colors.text.primary` com borda leve.
- Manter `motion.div` no container principal para entrada/hover já existentes.

## Implementação
- `components/kanban/KanbanItemCard.tsx`
  - Importar `Tooltip` de `../ui`.
  - Adicionar função `getInitials` dentro do arquivo.
  - Inserir `FooterRow` após `Actions` atual, ou substituir `Actions` + `Meta` por `FooterRow` com ambos.
  - Renderizar `Tooltip` envolvendo `AvatarCapsule` com conteúdo: `${openedBy?.name} (${openedBy?.email})`.
  - Tratar `openedBy: null` exibindo `--` e sem tooltip.

## Verificação
- Checar cards com e sem `openedBy`.
- Confirmar tooltip e posicionamento no rodapé.
- Garantir drag-and-drop permanece funcional.

Posso aplicar essas mudanças?