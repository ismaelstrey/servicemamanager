## Objetivo
- Construir a página “Service Orders Kanban” para visualização e operação das OS por status, com drag-and-drop nativo, filtros e ações rápidas, utilizando styled-components e componentes de UI existentes.

## Funcionalidades Principais
- Colunas por status: pending, scheduled, in_progress, waiting_parts, waiting_customer, completed, cancelled.
- Cartões de OS com título, número, prioridade, responsável e badges de status/priority.
- Drag-and-drop nativo entre colunas (alteração de status), com reordenação dentro da coluna.
- Filtro por provedor, prioridade e período; busca por título/number.
- Ações rápidas no cartão: abrir detalhes, alterar status via menu, adicionar comentário (modal).
- Carregamento com LogoLoader fullscreen e Skeleton em colunas (se necessário).

## Estrutura de UI (reutilização + styled-components)
- Layout geral: `PageWrapper`, `Toolbar`, `Board`, `Column`, `ColumnHeader`, `ColumnBody`, `CardItem` (todos styled-components, consumindo tokens de tema).
- Reutilização de UI: `Select`, `SearchBox`, `Badge`, `Button`, `Dropdown`, `Modal`/`ModalBody`/`ModalFooter`, `Toast`.
- Responsivo: grid fluido com colunas reduzindo largura em telas menores; scroll horizontal quando necessário.

## Dados e Tipos
- Tipo `ServiceOrder` já existente: usar os campos `id`, `number`, `title`, `status`, `priority`, `assignee`, `createdAt`, etc.
- Mapeamento de status → colunas, prioridade → `Badge` variant (`low/success`, `medium/info`, `high/warning`, `urgent/danger`).

## Estado e Data-Fetching
- React Query: hook `useServiceOrdersKanban()` com:
  - `listBoard(filters)` → retorna OS agrupadas por status.
  - `updateStatus(id, newStatus, position?)` → atualiza status (e ordem opcional) com optimistic update.
  - `addComment(id, content)` → adiciona comentário.
- Cache por filtros (providerId, prioridade, período); invalidação seletiva após mutações.

## Drag-and-Drop (Sem novas libs)
- HTML5 drag events: `draggable` nos cartões, `onDragStart` com payload (id, sourceColumn, sourceIndex).
- `onDragOver`/`onDrop` nas colunas: cálculo de destino (status e index), feedback visual (estilos hover).
- Atualização de estado local imediata (optimistic), seguida de `updateStatus` no hook.
- Framer Motion apenas para animações de entrada/reordenação (opcional), sem dependência externa.

## Styled-Components (Tema)
- Colunas e cartões usam `theme.colors.background.secondary`, `text.primary/secondary`, `borders.radius`, `spacing` e `shadows`.
- Estados visuais: hover, selected, drag-over, com transições (`theme.animations.transition.fast`).

## Filtros e Toolbar
- `Select` para provedor (global ou específico), prioridade e período.
- `SearchBox` com `onSearch` e `onClear` mutando filtros no `useServiceOrdersKanban`.
- Botões de ação (ex.: “Criar OS”, “Ver Relatórios”).

## Modais e Ações
- `ChangeStatusModal` (opcional) usando `Modal` já padronizado, para alteração com comentário.
- `AddCommentModal` com `TextArea` e botões `Cancelar/Salvar`.
- `Toast` para feedback de sucesso/erro.

## Tratamento de Erros e Carregamento
- Estado inicial: `LogoLoader fullscreen` enquanto carrega board.
- Erros: `Alert danger` no topo do board com opção de retry.
- Colunas: `Skeleton` enquanto dados individuais carregam (quando aplicável).

## Acessibilidade
- Drag-and-drop com alternativa por teclado: `Dropdown` “Mover para…” no cartão.
- Roles e aria-labels em colunas (`aria-labelledby` com `ColumnHeader`), cartões com `aria-grabbed` durante drag.

## Performance
- Paginação por coluna (lazy load) quando muitos itens; `VirtualList` (se já existente) opcional.
- Debounce em busca; memoização de colunas e itens.

## Entregáveis Técnicos
- Página `ServiceOrdersKanbanPage.tsx` estruturada com styled-components e UI existente.
- Hook `useServiceOrdersKanban.ts` para fetch/mutate via React Query.
- Styled-components: `Board.styles.ts` (ou inline no page) seguindo padrão do projeto.
- Testes básicos de drag-and-drop e atualização de status (unit/integration, se aplicável).

## Fases
- Fase 1: Layout base com colunas e carga inicial (LogoLoader, Alert).
- Fase 2: Cartões, filtros (Select/SearchBox), integração do hook.
- Fase 3: Drag-and-drop nativo com optimistic update.
- Fase 4: Modais de comentário/alteração, toasts, animações (framer-motion).
- Fase 5: Responsivo, acessibilidade, otimizações (paginação/virtualização, debounce).

Confirma prosseguir com essa implementação utilizando styled-components e os componentes de UI existentes do projeto?