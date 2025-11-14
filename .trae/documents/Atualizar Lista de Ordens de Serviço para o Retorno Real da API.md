## Objetivo
- Adequar `/service-orders` à resposta real de `/api/service-orders`, exibindo campos corretos e usando paginação/filtros no servidor.

## Diferenças de Modelo
- API retorna: `title`, `description`, `status`, `priority`, `scheduledDate`, `estimatedHours`, `cost`, `provider`, `ticket`, `createdAt`, `updatedAt`, além de `pagination` (`page`, `limit`, `total`, `totalPages`).
- Página atual usa campos não presentes: `customerName`, `estimatedCost`, `category`, `dueDate`.
- Serviço atual (`src/services/serviceOrderService.ts`) tipa com `customerName`/`estimatedCost` e não inclui `scheduledDate`, `provider`, `ticket`.

## Alterações Planejadas
1. Atualizar tipos do serviço
- Ajustar `ServiceOrder` em `src/services/serviceOrderService.ts` para refletir a API:
  - Adicionar: `scheduledDate`, `startedAt`, `completedAt`, `cost`, `providerId`, `ticketId`, `provider?: { id; name; ... }`, `ticket?: { id; title; status; priority; ... }`.
  - Tornar opcionais antigos campos que não vêm na API (ex.: `estimatedCost`, `customerName`), ou removê-los se não usados.
- Tipar `getServiceOrders` como `PaginatedResponse<ServiceOrder>` coerente com a resposta fornecida (tem `data` e `pagination`).

2. Integrar a página com os novos campos
- Em `src/pages/service-orders/ServiceOrdersListPage.tsx`:
  - Remover uso de `customerName`, `estimatedCost`, `category`, `dueDate`.
  - Exibir em tabela:
    - `ID`, `Título`, `Provedor` (`provider.name`), `Status`, `Prioridade`, `Agendada` (`scheduledDate`), `Estimado (h)` (`estimatedHours`), `Ticket` (`ticket.id`/`ticket.title`), `Ações`.
  - Grid: espelhar os mesmos campos.
  - Atualizar `getStatusLabel`/`getStatusVariant` para os status atuais da API.
  - Manter `searchTerm`, `statusFilter`, `priorityFilter` enviados ao servidor; remover `categoryFilter` (não há `category` no retorno).

3. Paginação real
- Usar `pagination.total`/`pagination.totalPages` no `Pagination`.
- Atualizar `itemsPerPage` para `pagination.limit` quando necessário.

4. UX/Erros
- Melhorar mensagem de erro com `e.response.data.message` quando presente.
- Manter `Spinner` e estados vazios.

## Verificação
- Rodar lint na página e serviço; garantir ausência de `any`.
- Build para validar tipos e importações.

## Entregáveis
- Tipos do serviço e lista atualizados; UI refletindo `provider` e `ticket` e datas de `scheduledDate`.

## Confirmação
- Posso aplicar essas mudanças agora para a página usar exatamente os campos do JSON que você forneceu e a paginação do backend?