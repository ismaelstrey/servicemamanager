## Objetivo
- Substituir todos os dados estáticos nas páginas em `src/pages/service-orders/` por integrações reais com a API, utilizando React Query, `ApiService` e styled-components, mantendo loaders/erros padronizados.

## Páginas Alvo e Integração
### 1) ServiceOrdersListPage.tsx
- Leitura: `GET /service-orders` com `page`, `limit`, `search`, `status`, `priority`, `providerId`.
- Ações: paginação, busca, filtros; navegação para detalhes/edição.
- UI: `ListTemplate`, `SearchBox`, `Pagination`, `Alert`, `LogoLoader`.

### 2) ServiceOrderDetailsPage.tsx
- Leitura: `GET /service-orders/:id` (detalhes completos: info, tasks, comments, attachments, history).
- Ações:
  - Atualizar status: `PATCH /service-orders/:id/status { status, note? }` com optimistic update.
  - Adicionar comentário: `POST /service-orders/:id/comments { content, isInternal }`.
- Remover mocks: `mockUser`, `mockServiceOrder`, `setTimeout` fakes.
- UI: manter styled e componentes; loaders com `LogoLoader`.

### 3) CreateServiceOrderPage.tsx
- Criar OS: `POST /service-orders` com payload do formulário.
- Seleção de cliente com modal (opcional) reutilizando `useCustomers`.
- Feedback: `Alert/Toast` e redirect para `/service-orders`.

### 4) EditServiceOrderPage.tsx
- Leitura: `GET /service-orders/:id`.
- Atualização: `PATCH /service-orders/:id` (campos editáveis: título, descrição, prioridade, tipo, categoria, dueDate, etc.).
- Remover placeholders e estáticos.

### 5) ServiceOrdersCalendarPage.tsx
- Leitura: `GET /service-orders/calendar` com `providerId`, `from`, `to`.
- Mapear resposta para eventos do componente de calendário.
- Remover estáticos; usar `LogoLoader` durante fetch.

### 6) ServiceOrdersKanbanPage.tsx
- Já ajustada para exigir `providerId`; manter `GET /service-orders/kanban?providerId=...`.
- Confirmar updates: `PATCH /service-orders/:id/status` no `handleDragEnd`.

### 7) ServiceOrdersReportsPage.tsx
- Leitura: `GET /service-orders/stats` ou `GET /service-orders/reports` (conforme backend), com `providerId`, `period`.
- Renderizar tabelas/gráficos com dados reais; remover dados estáticos.

## Hooks e Serviços
- Criar/expandir `useServiceOrders()` com React Query:
  - `listServiceOrders(params)`
  - `getServiceOrder(id)`
  - `createServiceOrder(data)`
  - `updateServiceOrder(id, data)`
  - `updateServiceOrderStatus(id, status, note?)`
  - `addServiceOrderComment(id, payload)`
  - `listCalendar(params)`
  - `listReports(params)`
- Reutilizar `ApiService` para chamar `http://localhost:4002/api/...` (já configurado no projeto).

## ProviderId
- Resolver em todas as páginas: query `?provider`, `localStorage.selectedProviderId` (não “global”), `decodeJwt(token).providerId`.
- Bloquear chamada e exibir `Alert danger` quando ausente.

## UX e Tema
- Loaders: `LogoLoader` fullscreen em estados de página; `Spinner/Skeleton` seccionais.
- Erros: `Alert danger` + `Toast` opcionais.
- styled-components: manter wrappers (`PageWrapper`, `HeaderRow`, `Section`, etc.) e tokens do theme.

## Remoção de Dados Estáticos
- Eliminar `setTimeout` simulando API, mocks e arrays fixos.
- Substituir estruturas locais por dados da API em tasks, comments, attachments, history nas páginas de detalhes e afins.

## Verificação
- Testar navegação e CRUD (criação/edição/status/comentários).
- Validar ausência de loaders duplicados.
- Garantir paginação e filtros funcionando.

## Fases
1. Remover mocks e integrar `ServiceOrderDetailsPage` (GET, status, comentários).
2. Integrar `ServiceOrdersListPage` (lista/filtros/paginação) e `EditServiceOrderPage` (GET/PATCH).
3. Integrar `CreateServiceOrderPage` (POST) e `ServiceOrdersCalendarPage` (GET calendário).
4. Ajustar `ServiceOrdersReportsPage` e refinamentos (toasts, erros, acessibilidade).

Confirma que eu avance com essas integrações, removendo os dados estáticos e conectando todas as páginas à API?