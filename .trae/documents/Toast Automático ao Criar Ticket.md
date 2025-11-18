## Objetivo
- Ao criar um ticket, mostrar um toast de sucesso que desaparece automaticamente sem exigir ação do usuário, e fechar o modal sozinho.

## Implementação
- `src/contexts/ticketCreateModalContext.tsx`:
  - Importar `Toast` dos componentes de UI.
  - Adicionar estados para o toast: `toastOpen`, `toastMsg`, `toastVariant`.
  - No `handleSubmit` em caso de sucesso:
    - Definir `toastOpen = true`, `toastMsg` com o número/id do ticket e `toastVariant = 'success'`.
    - Disparar o evento `ticket-created` (mantido).
    - Agendar `close()` do modal e `setToastOpen(false)` com `setTimeout` (ex.: 1500 ms).
  - Renderizar `<Toast />` no provider, fora do modal (para ficar visível mesmo após fechar o modal).
  - Manter o formulário sem botões internos (já ajustado) e manter os botões do rodapé do modal; em sucesso, o modal será fechado automaticamente.

## Verificação
- Criar ticket pelo modal e observar toast de sucesso.
- O toast desaparece sozinho e o modal é fechado sem interação.
- Lista/Kanban/Dashboard continuam a atualizar via `ticket-created` e invalidação do React Query.

Posso aplicar as mudanças agora?