## Objetivo
Ao adicionar um comentário na página `/tickets/:id`, realizar um POST na API para persistir o comentário e refletir na UI de forma confiável.

## Endpoint e payload
- Endpoint: `POST /tickets/:id/comments`
- Payload: `{ content: string, isInternal?: boolean }`
- Adaptação: usar `ApiService.post` que já normaliza envelopes `{ success, data }`.

## Alterações
- `frontend/src/pages/tickets/TicketDetailsPage.tsx`
  - Substituir o `setTimeout` de simulação em `handleAddComment` por chamada real: `ApiService.post<TicketComment>(...)`.
  - Em caso de sucesso, usar o comentário retornado (`res.data`) e acrescentar ao estado `ticket.comments`.
  - Em caso de erro, mostrar `Alert` e `Toast` de erro como já feito em outras ações.
  - Manter `commentLoading` para UX.

## UX/Estados
- `commentLoading` controla botão e modal.
- Mensagem de sucesso breve exibida.

## Sem novos arquivos
- Apenas editar o arquivo existente.

## Validação
- Testar em `/tickets/151`: comentar e verificar que a API recebe o POST, e que o comentário aparece listado.

Posso aplicar essas mudanças agora?