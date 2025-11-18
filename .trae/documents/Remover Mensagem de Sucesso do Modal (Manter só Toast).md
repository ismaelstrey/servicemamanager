## Objetivo
- Ao criar um ticket, exibir apenas o toast de sucesso e remover qualquer mensagem/alerta dentro do modal.

## Mudanças
- `src/contexts/ticketCreateModalContext.tsx`:
  - No bloco de `success`, não renderizar o `<Alert>` dentro do `ModalBody`.
  - Não renderizar `ModalFooter` quando `success` estiver definido (o modal fecha automaticamente).
  - Manter o toast com auto-dismiss como feedback único.

## Verificação
- Criar ticket: apenas o toast aparece; o modal não mostra mensagem extra e fecha sozinho.

Posso aplicar as alterações agora?