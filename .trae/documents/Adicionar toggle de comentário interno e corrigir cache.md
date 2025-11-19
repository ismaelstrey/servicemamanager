## Objetivo
- Adicionar um toggle para selecionar se o comentário é interno (padrão: público).
- Garantir que, ao adicionar comentário, a lista de comentários seja atualizada e não dependa de “clear cache” do navegador.

## Implementação
- Página de detalhes do ticket (`TicketDetailsPage.tsx`):
  - Criar estado `newCommentIsInternal` default `false`.
  - Adicionar `Switch` no modal de comentário para marcar “Comentário interno”.
  - Enviar `isInternal: newCommentIsInternal` no POST.
  - Após sucesso, refazer a leitura de comentários via serviço e atualizar o estado.
  - Resetar o toggle após fechar o modal.
- Serviço de tickets (`ticketService.ts`):
  - Atualizar `getTicketComments(id)` para incluir parâmetro `_t=Date.now()` junto a `includeInternal=true` e evitar cache do navegador.

## Verificação
- Em `/tickets/321`, abrir modal de comentário, alternar público/interno e adicionar.
- Confirmar que o novo comentário aparece imediatamente sem limpar cache.
- Revisitar a página: comentários atualizados devem aparecer (cache bust com `_t`).