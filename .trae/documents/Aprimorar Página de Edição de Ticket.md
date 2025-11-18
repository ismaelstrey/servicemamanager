## Objetivo
Aprimorar `/tickets/:id/edit` para refletir totalmente o envelope da API e permitir edição segura (título/descrição/status/prioridade), com envio via PATCH e feedback ao usuário.

## Dados Exibidos
- Mostrar campos já normalizados: `number`, `title`, `description`, `status`, `priority`, `source`.
- Adicionar seção informativa com `createdAt` e `updatedAt` formatados (`toLocaleString('pt-BR')`).

## Edição e Envio
- Transformar `title` e `description` em inputs controlados.
- Tornar `status` e `priority` selects com opções do tipo (`TicketStatus`, `Priority`).
- Adicionar botão “Salvar alterações” que:
  - Desabilita durante envio
  - Chama `ApiService.patch('/tickets/:id', payload)`
  - Atualiza o estado com resposta normalizada
  - Exibe `Alert` de sucesso/erro

## Tipagem e Normalização
- Manter tipo local `EditTicket` (mínimo necessário) e normalizar `status` (`waiting_client` → `pending`).
- Garantir `number = String(id)` quando não existir no retorno.

## Hook de API (Padrão do Projeto)
- Criar `src/hooks/useTicket.ts` para acesso:
  - `useTicket(id)` → busca com `ApiService.get` (envelope)
  - `useUpdateTicket()` → mutation com `ApiService.patch`
- Atualizar `TicketsEditPage` para usar o hook, mantendo componente limpo e reutilizável.

## Validação
- Rodar lint do arquivo e do hook.
- Testar fluxo: carregar ticket, editar título/descrição/status/prioridade, salvar, ver feedback e estado atualizado.

## Observações
- Sem criação de novas rotas.
- Sem alterar `TicketService` global neste passo.
- Seguir convenções: TypeScript, React, camelCase, sem `any`, sem comentários no código.