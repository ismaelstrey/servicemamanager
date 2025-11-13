## Problema
- Chamada atual usa `providerId` e datas ISO com hora (`from/to`), causando erro de validação: campo `id` esperado como inteiro.

## Ajustes Propostos
- Alterar a requisição em `ServiceOrdersCalendarPage.tsx` para enviar:
  - `id` (inteiro) no lugar de `providerId`.
  - `from` e `to` em formato `YYYY-MM-DD` (sem hora/timezone).
- Resolver `id` a partir de `selectedProviderId` ou `decodeJwt(token).providerId`.
- Validar `id` (inteiro positivo); se ausente, exibir `Alert danger` e não chamar a API.

## Implementação Técnica
- Função util local para formatar data: `formatDate(date: Date): string` → `YYYY-MM-DD`.
- Calcular intervalo:
  - `from`: primeiro dia do mês atual (`new Date(year, month, 1)`).
  - `to`: último dia do mês atual (`new Date(year, month + 1, 0)`).
- Requisição: `ApiService.get('/service-orders/calendar', { params: { id, from, to } })`.

## Verificação
- Abrir `/service-orders/calendar` e inspecionar URL gerada (`id` correto, datas sem horas).
- Confirmar que a API não retorna erro e popula o calendário.

Confirma aplicar essa correção nos parâmetros?