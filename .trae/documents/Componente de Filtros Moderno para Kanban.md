## Objetivo
- Criar um componente de filtros para o Kanban, oculto por padrão, com um botão discreto para exibir/ocultar.
- Filtros: por prioridade (low, medium, high, urgent, critical) e campo de busca.
- Padrões: styled-components, cores do theme, animação com framer-motion.

## Implementação
### 1) Componente `KanbanFilters`
- Arquivo: `src/components/tickets/KanbanFilters.tsx`
- Props: `visible`, `onToggle`, `priority`, `onPriorityChange`, `search`, `onSearchChange`.
- UI:
  - Botão minimalista (variant ghost) “Filtros” para abrir/fechar.
  - Painel animado (framer-motion) com `Select` para prioridade e `SearchBox` para busca.
  - Estilos com styled-components e cores do theme.

### 2) Integração no Kanban
- Arquivo: `src/pages/tickets/TicketsKanbanPage.tsx`.
- Estado: `filtersOpen`, `priorityFilter: 'all'|'low'|'medium'|'high'|'urgent'|'critical'`, `searchTerm`.
- Renderizar `KanbanFilters` abaixo do header.

### 3) Aplicar filtros nos cards
- `useMemo` para construir `filteredBoard` a partir de `board`, aplicando:
  - Filtro de prioridade (quando não for `all`).
  - Filtro de busca por título (case-insensitive).
- Passar `filteredBoard` para `<KanbanBoard board={filteredBoard} />`.

### 4) Animação
- Usar `motion.div` no painel, com animações de opacity/height e transição suave.

## Verificação
- Por padrão, filtros escondidos; ao clicar “Filtros” abre/fecha suavemente.
- Ajustar prioridade e busca; Kanban atualiza os cards exibidos conforme filtros.

Posso aplicar as alterações agora?