## Objetivo
- Permitir selecionar quais colunas (statuses) aparecem no Kanban de Tickets para reduzir ocupação de tela.

## Contexto Atual
- Colunas definidas por `columnOrder` em `src/pages/tickets/TicketsKanbanPage.tsx:22`.
- Renderização usa `KanbanBoard` com `columnOrder={columnOrder}` em `src/pages/tickets/TicketsKanbanPage.tsx:122–126`.
- O board garante todas as colunas existirem, mesmo vazias.

## Desenho da Solução
- Introduzir um filtro de colunas, com checkboxes para cada status disponível.
- Manter um estado `selectedColumns`, persistido em `localStorage`.
- Derivar `visibleColumnOrder = baseColumnOrder.filter(c => selectedColumns.includes(c))` e passar ao `KanbanBoard`.
- Garantir que sempre haja ao menos uma coluna selecionada e oferecer ações rápidas: "Selecionar todas" e "Ocultar resolvidos/fechados".

## Implementação
1. Refatorar a constante:
   - Renomear `columnOrder` para `baseColumnOrder` em `src/pages/tickets/TicketsKanbanPage.tsx:22`.
   - Criar estado: `selectedColumns` inicializado de `localStorage` (fallback para todas), e `visibleColumnOrder` derivado.
2. Integrar no Kanban:
   - Alterar a prop de `KanbanBoard` para `columnOrder={visibleColumnOrder}` em `src/pages/tickets/TicketsKanbanPage.tsx:124`.
   - Manter o `board` contendo todas as chaves; visibilidade será guiada apenas por `visibleColumnOrder`.
3. UI do filtro (styled-components):
   - Criar `src/components/tickets/TicketsKanbanColumnsFilter.tsx` com `styled-components`:
     - Lista de checkboxes para `open`, `assigned`, `in_progress`, `pending`, `resolved`, `closed`, `cancelled` (rótulos de `statusLabels`).
     - Botões: "Selecionar todas" e "Ocultar resolvidos/fechados".
   - Posicionar ao lado das ações existentes (voltar para lista / novo ticket) em `TicketsKanbanPage`.
4. Persistência:
   - `useEffect` para gravar `selectedColumns` em `localStorage` (`tickets.kanban.visibleColumns`).
   - Sanitizar leitura (validar somente statuses válidos).

## Acessibilidade e UX
- Checkboxes com `aria-label` por status e foco visível.
- Filtro responsivo: quebra em múltiplas linhas em telas estreitas.
- Mensagem tooltip/ajuda breve explicando que colunas desmarcadas não são exibidas.

## Testes e Verificação
- Verificar que alternar seleção atualiza imediatamente as colunas.
- Persistência: recarregar a página mantém seleção.
- Drag & Drop continua funcional entre colunas visíveis.
- Build e lint sem novos erros; manter tipos explícitos (sem `any`).

## Impacto e Riscos
- Baixo risco: alteração não afeta API nem estados de negócio.
- Performance inalterada; renderiza menos colunas quando desmarcadas.

## Entregáveis
- Componente `TicketsKanbanColumnsFilter` (styled-components).
- Atualização de `TicketsKanbanPage` com `selectedColumns`, persistência e integração.

## Confirmação
- Posso implementar agora conforme o plano acima e lhe entregar a refatoração com validação de lint e build?