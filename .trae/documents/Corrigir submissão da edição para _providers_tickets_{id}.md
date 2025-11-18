## Diagnóstico
- Verificar código atual da página: o botão “Salvar alterações” usa `useUpdateTicket()` e envia `PUT /providers/tickets/{id}`; a busca está em `GET /providers/tickets/{id}`.
- Identificar chamadas legadas: `TicketService.updateTicket` ainda aponta para `/tickets/{id}`; outras telas usam `/tickets` diretamente (ex.: status em detalhes).
- Possível causa de envio errado: alguma referência antiga acionada no submit, default submit de formulário, ou serviço compartilhado.

## Correções
1) Blindar o botão de salvar contra submit padrão:
- Definir `type="button"` no botão “Salvar alterações” para evitar submit de um `<form>` ancestral, caso exista.

2) Unificar endpoints de tickets para providers:
- Atualizar `TicketService.updateTicket` para `PUT /providers/tickets/{id}`.
- Atualizar `TicketService.updateTicketStatus` para `PUT /providers/tickets/{id}/status`.
- Revisar `TicketDetailsPage.tsx` para usar o caminho `/providers/tickets/{id}/status`.

3) Verificação e testes
- Lint e checagem de tipos nos arquivos alterados.
- Testar `/tickets/:id/edit`: confirmar que “Salvar” chama `PUT /api/providers/tickets/{id}`.
- Testar vinculação de cliente: confirmar `PATCH /api/providers/tickets/{id}`.

## Observações
- Mantém o padrão de hooks para acesso à API e tipagem estrita.
- Não altera rotas do React; apenas normaliza os endpoints usados internamente.
- Sem criação de novas estruturas; apenas ajustes nos pontos de atualização.