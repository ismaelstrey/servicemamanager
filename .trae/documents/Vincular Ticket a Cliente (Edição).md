## Objetivo
- Permitir vincular/alterar o cliente de um ticket na página de edição (`/tickets/:id/edit`), com busca, seleção e confirmação, usando styled-components e componentes de UI existentes.

## Escopo da Edição
- Mostrar dados básicos do ticket (título, número, status, prioridade) e o cliente atual vinculado (se houver).
- Ação “Alterar cliente” que abre seleção (modal) com busca/filtragem e confirmação.
- Persistir a alteração do cliente via API com feedback de sucesso/erro.

## UI/UX (styled-components)
- Estruturas styled:
  - `PageWrapper`, `HeaderRow`, `Section`, `FieldRow`, `ActionsRow` com `theme.spacing/colors/typography`.
- Componentes de UI reutilizados:
  - `Heading`, `Badge`, `Button`, `Alert`, `LogoLoader`, `Select`, `SearchBox`, `Modal/ModalBody/ModalFooter`, `Toast`, `Table`.
- Modal de seleção de cliente:
  - Título “Selecionar Cliente”, `SearchBox` (nome/email/documento), `Table` paginada com clientes, `Button` “Vincular”.
  - Estados de carregamento com `LogoLoader fullscreen` (carregamento inicial da página) e `Spinner`/`Skeleton` dentro do modal.

## Dados e APIs
- Leitura do ticket: `GET /tickets/:id`.
- Busca de clientes: `GET /customers?query=&page=&limit=` (opcional: `providerId` se aplicável).
- Atualização do vínculo: `PATCH /tickets/:id` body `{ customerId }`.
- Regras:
  - Validar que `customerId` existe e pertence ao mesmo `provider` do ticket (se houver multitenancy); caso contrário, bloquear.
  - Registrar histórico opcional “Cliente vinculado” (se o backend suportar).

## Estado e Hooks
- `useTicketEdit(id)` (React Query):
  - `getTicket(id)` → dados do ticket
  - `updateTicketCustomer(id, customerId)` → mutate com optimistic update
- `useCustomersSearch(filters)` (React Query):
  - `listCustomers({ query, page, limit, providerId })`
- Resolver `providerId`: query `?provider`, `localStorage.selectedProviderId`, `decodeJwt(token).providerId`.

## Fluxo
1. Entrar em `/tickets/:id/edit`:
   - Exibir `LogoLoader` enquanto busca ticket; ao carregar, cabeçalho com título/ID/status/cliente atual.
2. Clicar “Alterar cliente”:
   - Abrir modal com `SearchBox`, tabela de clientes e paginação.
   - Buscar lista ao digitar/Enter e ao trocar página.
3. Selecionar cliente e confirmar:
   - Chamar `updateTicketCustomer(id, customerId)`, fechar modal, mostrar `Toast` de sucesso.
   - Em erro, manter modal aberto e exibir `Alert danger` com mensagem.

## Validações
- Impedir confirmar sem cliente selecionado.
- Se `providerId` não encontrado: exibir `Alert danger` e bloquear busca (mensagem “providerId obrigatório”).
- Tratar ausência de clientes: estado “Sem resultados”.

## Acessibilidade
- Modal com `aria-modal` e foco gerenciado (já suportado pelo `Modal` padronizado).
- Tabela com `aria-label` e headers semânticos.
- Teclado: Enter no `SearchBox` dispara busca; setas navegam linhas (opcional).

## Segurança
- Não expor dados sensíveis do cliente; sanitizar entradas de busca.
- Garantir que apenas usuários autorizados possam alterar o cliente (verificação no backend; frontend exibe fallback se 403).

## Implementação Técnica
- Página `TicketsEditPage.tsx` (ou adaptar página existente de edição):
  - styled-components wrappers
  - Render do cliente atual (nome, email, documento) com `Badge` opcional
  - Botão “Alterar cliente” abre `SelectCustomerModal`
- `SelectCustomerModal.tsx` (componente composto):
  - `SearchBox`, `Table` (colunas: Nome, Email, Documento, Ações)
  - Paginação com `Pagination`
  - Confirmar apenas com seleção ativa
- Hooks:
  - `src/hooks/useTickets.ts` → add `updateTicketCustomer`
  - `src/hooks/useCustomers.ts` → add `searchCustomers`

## Testes/Verificação
- Carregar ticket existente com cliente vinculado: mostra corretamente.
- Trocar cliente: sucesso (ticket atualizado) e `Toast` exibido.
- Buscar cliente inexistente: “Sem resultados”.
- providerId ausente: erro visível e sem requisições.

## Fases
- Fase 1: Página base e carregamento do ticket.
- Fase 2: Modal de seleção com busca/paginação.
- Fase 3: Atualizar vínculo via PATCH com optimistic update e toasts.
- Fase 4: Validações, acessibilidade, refinamentos visuais.

Confirma que seguimos com essa implementação utilizando styled-components e os componentes de UI existentes?