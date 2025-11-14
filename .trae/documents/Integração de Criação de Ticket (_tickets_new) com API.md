## Visão Geral
- Conectar o formulário de criação de ticket (`/tickets/new`) ao backend.
- Seguir o padrão do projeto: acesso à API via hook reutilizável, tipagem forte e uso de React Query.
- Remover mocks (submit e equipamentos) e usar endpoints reais.

## Endpoints e Tipos
- Criar ticket: `POST /{providerId}/tickets` (já previsto em `TicketService.createTicket`).
- Tipos existentes: `CreateTicketData` em `src/types/ticket.ts`.
- Obter equipamentos do provedor (opcional no formulário): `GET /providers/{providerId}/equipments` (padrão usado em `EquipmentsPage`).

## Hook de Tickets
- Criar `src/hooks/useTickets.ts` com:
  - `useCreateTicket`: `useMutation` que chama `TicketService.createTicket(providerId, data)`.
  - Resolver `providerId`: `useAuth().user?.providerId` ou `localStorage.selectedProviderId` (validar inteiro positivo).
  - Normalizar dados do formulário para `CreateTicketData`:
    - `priority`: `'low' | 'medium' | 'high' | 'urgent'` (já compatível).
    - `category`: transformar para minúsculas para alinhar com o backend.
    - `source`: `'web'`.
    - `customerInfo`: preencher com `{ name: '-', email: '-' }` quando não houver cliente selecionado.
    - `equipmentId`: converter `string` → `number` quando informado.
  - Expor estados: `isPending`, `error`, `mutateAsync`.

## Integração no CreateTicketPage
- Importar o hook e substituir o submit simulado por `await mutateAsync(data)`.
- Mapear `CreateTicketFormValues` → `CreateTicketData` conforme regras de normalização acima.
- Em sucesso:
  - Mostrar sucesso como já faz e redirecionar.
  - Opcional: redirecionar para `/tickets/:id` se o endpoint retornar o ticket criado com `id`.
- Em erro:
  - Exibir mensagem vinda do backend (`err.response.data.message` quando existir).

## Equipamentos (opcional)
- Substituir `loadEquipment` mock por chamada real:
  - `GET /providers/{providerId}/equipments?limit=100` usando `ApiService`.
  - Preencher `equipmentList` com `{ id, name }`.
- Tratar falhas sem bloquear o formulário (mantendo a seleção opcional).

## Validações e UX
- Manter validações atuais (título, descrição, categoria).
- Desabilitar botões durante `isPending`.
- Preservar feedback visual de sucesso/erro já existente.

## Segurança e Cabeçalhos
- Reaproveitar `ApiService` (token JWT já configurado).
- Garantir que `providerId` sempre seja inteiro positivo antes de chamar a API.

## Testes e Verificação
- Fluxo manual:
  - Abrir `/tickets/new`, preencher e enviar.
  - Verificar criação no backend e redirecionamento.
- Automatizável depois: teste unitário do hook simulando resposta do `TicketService`.

## Critérios de Aceite
- Submissão chama o backend e cria o ticket.
- Sem dados estáticos/mocks no submit e na lista de equipamentos.
- Estados de carregamento e mensagens de erro funcionam.
- Padrões de projeto respeitados (hook para API, TypeScript, React Query).

Confirma a implementação conforme o plano?