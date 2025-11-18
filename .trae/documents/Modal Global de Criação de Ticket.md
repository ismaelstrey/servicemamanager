## Objetivo
- Tornar a criação de ticket um modal global acionável em qualquer página (inclusive menu/header), sem navegar para outra rota.

## Solução
- Criar um contexto global `TicketCreateModalProvider` com hook `useTicketCreateModal()` que expõe `open()` e `close()`.
- Renderizar um `TicketCreateModalHost` no topo da árvore (em `App.tsx`) que usa `Modal` e reutiliza o `TicketForm` para o conteúdo.
- Integrar o botão "Criar Ticket" do header para chamar `open()` do contexto.
- Atualizar botões existentes que navegam para `/tickets/new` para chamarem `open()` (Dashboard QuickActions e Kanban).

## Implementação
1) `src/contexts/ticketCreateModalContext.tsx`
- Estado: `isOpen`, `initialData?`.
- Métodos: `open(initialData?)`, `close()`.
- Host: renderiza `Modal` com `TicketForm`, faz validação simples (mesma lógica da página), chama `useTickets().createTicket` no submit e fecha após sucesso.

2) `src/App.tsx`
- Envolver Providers com `TicketCreateModalProvider` e renderizar `<TicketCreateModalHost />` (fora das rotas) para que o modal esteja sempre disponível.

3) `src/components/layout/Layout.tsx`
- Alterar o botão "Criar Ticket" para `onClick={() => ticketModal.open()}`.

4) `src/pages/dashboard.tsx`
- Substituir `onCreateTicket: () => navigate('/tickets/new')` por `onCreateTicket: () => ticketModal.open()` ao montar `quickActions`.

5) `src/pages/tickets/TicketsKanbanPage.tsx`
- Trocar o botão "Novo Ticket" para abrir o modal com `ticketModal.open()`.

## Verificação
- Clicar em "Criar Ticket" no header abre modal.
- Clicar em "Criar Ticket" nas ações rápidas do dashboard abre modal.
- Clicar em "Novo Ticket" no Kanban abre modal.
- Após criar, mostrar confirmação e opcionalmente link para o ticket; manter usuário na página atual.

Posso aplicar as alterações agora?