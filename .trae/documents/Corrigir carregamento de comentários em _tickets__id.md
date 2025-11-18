## Diagnóstico
- O 404 vem de `GET /api/providers/tickets/{id}/comments` (TicketService.getTicketComments), que não existe.
- O endpoint correto informado é `GET /api/comments/ticket/{id}?includeInternal=true`.
- A página de detalhes usa `TicketService.getTicketComments(id)`, então precisamos alinhar o serviço.

## Correções
1) Atualizar `TicketService.getTicketComments(id)`
- Trocar para `GET /comments/ticket/{id}?includeInternal=true`.
- Tipar retorno como `TicketComment[]`.

2) Conferir uso na página de detalhes
- Garantir que `TicketDetailsPage` chama apenas `TicketService.getTicketComments(id)` (já faz), sem chamadas diretas ao endpoint antigo.

3) Opcional: alinhar criação de comentário
- Se seu backend também espera `POST /comments/ticket/{id}`, podemos alinhar `handleAddComment` para esse caminho e payload `{ content, isInternal }`.

## Verificação
- Lint nos arquivos alterados.
- Testar `/tickets/315`: Network deve mostrar `GET /api/comments/ticket/315?includeInternal=true` e carregar a lista.
- Testar adicionar comentário se atualizarmos o POST.

## Observações
- Sem mudanças em rotas React; apenas serviços.
- Mantém compatibilidade com `ApiService` baseURL e headers.