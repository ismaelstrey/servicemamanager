## Objetivo
Remover as colunas "Cliente" e "Categoria" da página `/tickets` no modo lista e ajustar mapeamentos de exportação para refletir a ausência desses campos.

## Arquivo alvo
- `frontend/src/pages/tickets/TicketsListPage.tsx`

## Alterações
1. **Tabela (viewMode === 'list')**
- Remover `<TableHeaderCell>Cliente</TableHeaderCell>` e `<TableHeaderCell>Categoria</TableHeaderCell>`.
- Remover os respectivos `<TableCell>` que exibem `ticket.customerInfo` e `categoryLabels[ticket.category]`.

2. **Grid (viewMode === 'grid')**
- Remover a linha que exibe `ticket.customerInfo.name/email` sob o título.
- Não há coluna de categoria no grid; nada adicional necessário.

3. **Exportação (mapas de dados)**
- Remover chaves `Cliente` e `Categoria` dos objetos usados em export (linhas ~212-234) para evitar divergência.

## Não mudaremos
- Filtros existentes (incluem categoria); foco apenas nas colunas visuais conforme solicitado.
- Demais funcionalidades (favoritos, ações, paginação, etc.).

## Validação
- Abrir `/tickets` e confirmar que a tabela exibe: Número, Título, Status, Prioridade, Responsável, Criado em, Ações.
- Executar build para garantir tipo e render sem erros.

Posso aplicar essas alterações agora?