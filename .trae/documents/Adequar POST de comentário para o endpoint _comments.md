## Objetivo
Alterar o envio de comentários na página `/tickets/:id` para usar o endpoint e payload esperados pela API: `POST /comments` com `{ content, resourceType, resourceId, isInternal }`.

## Arquivo alvo
- `frontend/src/pages/tickets/TicketDetailsPage.tsx`

## Alterações
1. **Endpoint**
- Trocar de `POST /tickets/:id/comments` para `POST /comments`.

2. **Payload**
- Enviar `{ content: string, resourceType: 'ticket', resourceId: number, isInternal: false }`.

3. **Tratamento da resposta**
- Continuar usando `ApiService.post` e `res.data` para anexar o comentário na lista.

## Validação
- Usar `/tickets/151`; adicionar comentário; verificar que a API recebe o POST e que o comentário aparece na UI.

Posso aplicar as mudanças agora?