## Objetivos
- Padronizar UI com styled-components e theme.
- Finalizar integrações essenciais (tickets, comentários, provedores).
- Corrigir erros de build/TypeScript e melhorar robustez de chamadas à API.
- Endereçar pendências de ambiente e segurança no backend.

## Achados Principais
- Frontend:
  - Ainda existem usos de classes e wrappers legados (ex.: `Pagination` usa classes; algumas páginas têm CSS residual).
  - Erros TS em `dashboard.tsx` e `ServiceOrdersCalendarPage.tsx` por imports não usados e comparações com tipos incompatíveis.
  - Tickets: tipos esperam campos que nem sempre vêm da API; normalização parcial já implementada em `TicketDetailsPage`.
- Backend:
  - Seed falha por chave inválida para AES-256-GCM; `.env` usa placeholder.
  - Comentários: endpoint correto é `POST /comments` com `{content, resourceType, resourceId, isInternal}`; frontend já atualizado.

## Plano por Fases
### Fase 1: Correções e Robustez
1. Corrigir erros TS no build:
   - Remover imports não usados em `dashboard.tsx` e `ServiceOrdersCalendarPage.tsx`.
   - Ajustar comparações de `selectedProviderId` (número/null) vs `'global'` para usar leitura de provider do localStorage/context com tipos consistentes.
2. Normalização dos dados de tickets:
   - Encapsular util `normalizeTicket(data)` para lidar com ausência de `category`, `assignee`, `customerInfo`, `tags`, `history`, `attachments` e mapeamentos de `status`.
   - Usar este util em `TicketService.getTicketById` ou no carregamento das páginas.
3. Comentários (UI/UX):
   - Após `POST /comments`, exibir feedback e scroll para o comentário mais recente; tratar estados `isInternal` quando usado.

### Fase 2: Padronização de UI
1. Substituir componentes com classes por styled-components:
   - `Pagination`: criar `Pagination.styles.ts` e mover lógica para styled; manter API atual.
   - Limpar CSS residual em `styles/auth.css` substituindo páginas de auth por `AuthTemplate` (em andamento) e remover dependências.
2. Revisar `globalStyles.ts`:
   - Garantir tokens do theme (cores, spacings, tipografia) estão refletidos; remover variáveis CSS não usadas.
   - Adicionar reset acessível (focus visible, contrast em alerts/badges).

### Fase 3: Funcionalidades e Navegação
1. Tickets List:
   - Refinar grid/list para campos disponíveis da API; já removido “Cliente” e “Categoria” no list.
   - Adicionar botão “Ver Provedor” usando `providerId` quando presente.
2. Ticket Details:
   - Exibir logo do provedor quando existir; link para `providers/:id`.
   - Anexos: validar tipo e tamanho; mostrar erro amigável.

### Fase 4: Backend e Ambiente
1. Chave de criptografia:
   - Gerar chave Base64 de 32 bytes para `CREDENTIALS_ENCRYPTION_KEY` e validar no seed.
2. Comentários:
   - Confirmar modelo `Comment` e relacionamentos com `resourceType/resourceId`; garantir paginação e ordenação por `createdAt`.
3. Observabilidade:
   - Adicionar logs estruturados para falhas de API; habilitar CORS conforme necessidade do frontend.

## Validação
- Rodar build sem erros TS.
- Fluxos:
  - `/tickets` e `/tickets/:id` com dados reais; comentários persistem via API.
  - `/login`, `/register`, `/forgot-password`, `/reset-password` com `AuthTemplate`.
- Revisar UI com theme em dark/light.

## Entrega
- Sem criar arquivos desnecessários; editar componentes existentes.
- Commits organizados por fase para facilitar revisão.

Posso iniciar pela Fase 1 (correções TS e util de normalização) e seguir as demais fases na sequência?