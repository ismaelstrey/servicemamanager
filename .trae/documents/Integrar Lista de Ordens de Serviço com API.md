## Objetivo
- Ajustar a página `/service-orders` para buscar ordens de serviço na API, com filtros e paginação reais.

## Mudanças Principais
- Remover mock local e substituir por chamada ao `ServiceOrderService.getServiceOrders(...)`.
- Alinhar o modelo exibido com o tipo `ServiceOrder` do serviço (campos como `customerName`, `estimatedCost`).
- Mapear filtros da UI para `ServiceOrderFilters` e enviar `page`/`limit`.
- Tratar estados de carregamento/erro e mostrar resultados paginados do backend (`PaginatedResponse`).

## Implementação
1. Importar serviço e tipos
   - `import { ServiceOrderService, type ServiceOrder, type ServiceOrderFilters } from '../../services/serviceOrderService'`.
2. Substituir `loadServiceOrders`
   - Implementar `async function loadServiceOrders()` que chama:
     - `const { data, pagination } = await ServiceOrderService.getServiceOrders({ search, status, priority, category, page: currentPage, limit: itemsPerPage })`.
   - Atualizar estados: `setServiceOrders(data)`, `setTotalItems(pagination.total)`.
3. Mapear filtros
   - Converter filtros locais (`statusFilter`, `priorityFilter`, `categoryFilter`, `searchTerm`) para os nomes aceitos na API.
   - Usar `'all'` como vazio (não enviar no query).
4. Tipagem e colunas
   - Adaptar colunas/labels:
     - `clientName` → `customerName`
     - `cost` → `estimatedCost`
     - Status: suportar também `waiting_parts`, `waiting_client` (mapear para rótulos amigáveis).
5. Paginação real
   - Ler `pagination.page`, `pagination.total`, `pagination.pageSize` do retorno e controlar `Pagination` com base nisso.
6. UX/Erro
   - `Spinner` enquanto carrega; `Alert` em erro (mensagem do backend quando disponível).
   - Preservar alternância `viewMode` (lista/grade) com os dados da API.
7. Provider opcional
   - Preparar para aceitar `providerId` quando for parte do contexto/url e incluir no filtro (se aplicável ao endpoint `/service-orders`).

## Testes e Verificação
- Validar filtros e paginação refletindo no resultado do backend.
- Confirmar tipagem sem `any` e ESLint passando.
- Rodar build e checar que a página usa dados da API corretamente.

## Entregáveis
- Atualização completa de `ServiceOrdersListPage.tsx` com integração da API.
- Labels e colunas ajustados ao modelo da API.

## Confirmação
- Posso implementar agora conforme este plano e entregar a página consultando a API com filtros e paginação?