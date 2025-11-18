## Diagnóstico
- A página `/tickets/:id` obtém o ticket via `TicketService.getTicketById` e assume `data.comments` no retorno.
- O envelope atual da API para ticket não inclui comentários; portanto, `ticket.comments` fica vazio.
- Há padrão existente para OS: `GET /service-orders/{id}/comments`. Para tickets, a rota equivalente deve ser `GET /providers/tickets/{id}/comments` (ou fallback por query em `/comments`).

## Correções
1) Alinhar endpoint do ticket
- Atualizar `TicketService.getTicketById` para `GET /providers/tickets/{id}`.

2) Implementar busca de comentários
- Criar `TicketService.getTicketComments(id)` usando `GET /providers/tickets/{id}/comments`.
- Fallback: se necessário, usar `GET /comments?resourceType=ticket&resourceId={id}`.

3) Atualizar a página de detalhes
- Em `TicketDetailsPage`, no `loadTicket(id)`, buscar o ticket e, em seguida, buscar os comentários.
- Atribuir `comments` do estado via retorno da nova chamada.
- Manter normalização de `status` (`waiting_client` → `pending`).

4) Opcional: alinhar adição de comentários
- Ajustar `handleAddComment` para `POST /providers/tickets/{id}/comments`, mantendo carga útil atual.

## Validação
- Lint nos arquivos alterados.
- Testar `GET /api/providers/tickets/320` seguido de `GET /api/providers/tickets/320/comments`.
- Confirmar que a aba de comentários exibe itens retornados.

## Observações
- Sem mudanças de rotas React.
- Mantém o padrão de tipagem sem `any` e uso de serviços centralizados.