# Relatórios

Escopo de relatórios de tickets, OS, desempenho e SLA.

## Endpoints
- `GET /api/reports/summary`
- `GET /api/reports/tickets`
- `GET /api/reports/service-orders`
- `GET /api/reports/export?type=tickets|serviceOrders&format=csv|pdf|xlsx`

## Filtros
- Período, status, tags, responsável, cliente.

## Frontend
- Página `/reports` com gráficos, KPIs e exportação.
- Hook `useReports` para chamada de API.