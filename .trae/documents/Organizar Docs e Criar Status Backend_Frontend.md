## Objetivo
- Organizar `/docs` em categorias claras e criar dois arquivos centrais: `backendStatus.md` e `frontendStatus.md` (camelCase), assinalando o que já foi feito, o que falta e novas implementações.

## Auditoria Rápida de `/docs`
- Help (guias de uso): `docs/help/*.md` (overview, auth, tickets, serviceOrders, reports, users, settings, integrations, envs, deploy, pm2, swagger)
- Backend: `backend-roadmap.md`, `redis-cache-documentation.md`, `zabbix-*.md`, `zabbix-endpoints-specification.md`
- Frontend e geral: `roadmap.md` (inclui extenso roadmap de frontend), `development-instructions.md`
- Tempo real: `roadmap-comunicacao-tempo-real.md` (cross frontend/backend)

## Estratégia de Organização (sem mover arquivos)
- Manter a estrutura atual e criar um ponto único de status para cada lado:
  - `docs/backendStatus.md` consolidando progresso do backend (fonte principal: `backend-roadmap.md` + itens de relatórios/clientes e performance)
  - `docs/frontendStatus.md` consolidando progresso do frontend (fonte principal: seção de frontend de `roadmap.md`)
- Atualizar navegação em `docs/help/index.md` adicionando links para os dois status.

## Arquivo: `docs/backendStatus.md` (estrutura)
- Título: Status do Backend — TelecomAI
- Tecnologias: Node.js, TypeScript, Express, Prisma, PostgreSQL, Redis, JWT/bcrypt, Zod, Swagger, pnpm, PM2
- Seções com checklists:
  - Autenticação e Fundações: [x] TS, [x] Express, [x] Prisma, [x] JWT/bcrypt, [x] .env
  - Provedores: [x] Controller/Service/Repository/Validators/Rotas; [x] estatísticas; [x] convites; [x] workspace
  - Equipamentos: [x] CRUD, [x] filtros por `status`/`type`, [x] enums de Prisma; [x] status; [x] histórico
  - Tickets: [x] CRUD, [x] status/prioridade, [x] filtros, [x] comentários
  - Cofre de Senhas: [x] CRUD, [x] AES-256-GCM, [x] RBAC por provedor, [x] auditoria
  - Dashboard/Relatórios: [x] controllers; [x] métricas; [x] rotas; [x] cache opcional; [ ] exportações avançadas
  - Ordens de Serviço: [x] CRUD, [x] workflow status/prioridade, [x] estatísticas, [x] comentários
  - Portal do Cliente (backend): [x] auth/profile/service-orders/tickets/notifications básicos; [ ] anexos; [ ] Swagger seção Client
  - IA: [x] AIController (14 métodos), [x] predição/falhas/anomalias/chat; [ ] integrações LLM externas
  - Performance/Security/Infra: [x] Redis + cache; [x] rate limit; [x] sanitização; [ ] índices DB; [ ] otimização de queries Prisma
- Pendências prioritárias:
  - Índices e otimizações Prisma; Kanban e notificações; histórico refinado; RBAC avançado do cofre
- Novas implementações sugeridas:
  - Exportação avançada de relatórios (CSV/PDF/XLSX), LLM externo, auditoria ampliada, seção Swagger “Client Portal”

## Arquivo: `docs/frontendStatus.md` (estrutura)
- Título: Status do Frontend — TelecomAI
- Tecnologias: React, TypeScript, Vite, react-router-dom, framer-motion, hooks de API; observação: alinhar com Tailwind v4 conforme regras do projeto (hoje há base em styled-components no roadmap)
- Seções com checklists (extraídas de `roadmap.md`):
  - Fundamentos/Design System: [x] Theme/tokens/breakpoints/mixins/globalStyles; [x] estrutura de pastas profissional
  - Hooks/Infra de Frontend: [x] `useApi`, [x] interceptors de auth, [x] rotas protegidas, [x] contexts
  - UI Atoms/Molecules/Organisms: [x] Button/Input/etc.; [x] Card/Modal/Tooltip/Tabs/Pagination; [x] Header/Sidebar/DataTable básico
  - Templates e Layouts: [x] AuthTemplate/Dashboard/List/Detail/Form/Error/EmptyState
  - Autenticação (páginas): [x] Login/Register/Forgot/Reset, [x] ProtectedRoute, [x] refresh token
  - Dashboard: [x] métricas/cards/gráficos/filtros/notificações
  - Tickets: [x] listas com filtros/kanban, [x] detalhes com comentários/anexos
  - Ordens de Serviço: [x] lista/calendário/form; [ ] mapas; [x] qualificação/workflow UI
  - Perfil/Configurações: [x] edição inline/avatar, [x] notificações, [x] tema/dark mode; [ ] 2FA
  - Relatórios: [x] página `/reports` com filtros; [ ] tabelas/gráficos KPIs completos; [ ] exportar
  - Help Page: [ ] `/help` para ler Markdown de `docs/help/*` via `useHelpDocs`
  - A11y/Performance: [x] framer-motion; [x] code splitting/lazy/memo; [x] virtual scrolling; [x] PWA; [ ] testes a11y e Storybook amplos
- Pendências prioritárias:
  - DataTable completo (sorting/filtering/paginação unificados), exportação em `/reports`, HelpPage, 2FA, notificações de cliente, acessibilidade WCAG
- Novas implementações sugeridas:
  - Migração gradual para Tailwind v4 (tokens via CSS vars), componente `Table` com `stickyHeader` prop, Storybook robusto, RBAC visual, i18n

## Atualizações em Navegação
- Adicionar em `docs/help/index.md`:
  - Links para: `[Status do Backend](../backendStatus.md)` e `[Status do Frontend](../frontendStatus.md)`
  - Manter sumário atual sem mover arquivos.

## Critérios de Aceitação
- Arquivos em camelCase no diretório raiz de `docs`.
- Checklists coerentes com `backend-roadmap.md` e `roadmap.md`.
- Itens “Novas implementações” claros e alinhados às regras do projeto.
- Navegação do Help com links para os dois status.

## Entregáveis na implementação
- Criar `docs/backendStatus.md` e `docs/frontendStatus.md` com conteúdo inicial consolidado (checklists e pendências/próximos passos).
- Atualizar `docs/help/index.md` para incluir os dois links.
- Não mover ou apagar documentos existentes; apenas organizar via links e resumos.

## Verificação
- Revisar consistência dos itens marcados como concluídos vs. pendentes.
- Conferir caminhos de links e abertura dos arquivos no IDE.
- Ajustar conforme feedback após leitura dos status.