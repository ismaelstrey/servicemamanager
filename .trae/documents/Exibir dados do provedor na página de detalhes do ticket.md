## Objetivo
Ao abrir `/tickets/:id`, além de buscar o ticket, buscar os dados do provedor via `providerId` e exibir um bloco com informações do provedor (nome, CNPJ, contato, endereço, plano, status), usando styled-components e o theme.

## Onde integrar
- `frontend/src/pages/tickets/TicketDetailsPage.tsx`: após carregar o ticket, disparar a busca do provedor.
- Usar `ProviderService.getById(providerId)` (já existente) ou `ApiService.get` com tratamento de envelope.

## Implementação
1. **Estado e efeitos**
- Adicionar estados: `provider`, `providerLoading`, `providerError`.
- No `loadTicket`, após `setTicket(normalized)`, se `normalized.providerId`, chamar `loadProvider(normalized.providerId)`.
- Função `loadProvider(id: number)` usando `ProviderService.getById(id)` e tratando `res.data` (já normalizado pelo `ApiService`).

2. **UI (sidebar)**
- Adicionar um novo `<Card>` “Informações do Provedor” ao lado de “Informações do Cliente” e “Detalhes do Ticket”.
- Conteúdo:
  - Nome, CNPJ, Workspace
  - Contatos: email, telefone, website
  - Plano, Status
  - Endereço: cidade, estado, CEP, país (quando disponível)
  - Datas: criado/atualizado
- Estados:
  - `providerLoading`: mostrar `<Spinner size="sm" />` dentro do Card
  - `providerError`: `<Alert variant="error">Falha ao carregar provedor</Alert>`
  - Sem dados: mostrar traços `—`
- Opcional: Se tiver `logo`, exibir no topo do Card, com `img` responsiva.

3. **Styling**
- Reusar `InfoItemRow`, `CardHeader`, `CardBody` já existentes no arquivo.
- Manter cores e espaçamentos via theme.

4. **Robustez**
- Tratar envelopes da API (o backend retorna `{ success, data }`). O `ApiService` já normaliza; `ProviderService.getById` retorna o `data` direto.
- Logar erros no console para depuração.

## Validação
- Usar o ticket `151` (retorno tem `providerId: 4`) e confirmar que o Card do provedor exibe informações retornadas de `GET /providers/4`.
- Verificar comportamento quando `providerId` não existe ou API falha.

## Entrega
- Apenas editar `TicketDetailsPage.tsx` com o carregamento e renderização do provedor; nenhum arquivo novo.
- Código minimalista e alinhado ao padrão atual do projeto.

Você confirma que eu siga com essas mudanças?