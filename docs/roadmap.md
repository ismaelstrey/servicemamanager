# TelecomAI Monorepo

Este documento descreve o roadmap detalhado, arquitetura em camadas, convenções e documentação de uso, seguindo as regras do projeto.

## Roadmap Detalhado

### Fase 1 — Fundamentos e Infra
- [ ] Estrutura monorepo (pnpm workspaces)
- [ ] Configuração de lint (ESLint TS)
- [ ] Backend Express + TS (camadas: controllers, routes, services, repositories, middlewares, utils, validators, docs, server.ts)
- [ ] Prisma + PostgreSQL (schema, migrações)
- [ ] Autenticação JWT + bcrypt
- [ ] Swagger (swagger-ui-express)
- [ ] Frontend React + Vite + TS
- [ ] styled-components, react-router-dom, framer-motion
- [ ] Hooks para API (useApi), autenticação (useAuth)

### Fase 2 — Domínio
- [ ] Provedores (CRUD)
- [ ] Equipamentos (Switch, OLT, roteador, servidor, virtualizador)
- [ ] Tickets (abertos, resolvidos)
- [ ] Cofre de senhas (acesso controlado)
- [ ] Links ativos
- [ ] Dashboard por workspace
- [ ] Visualizações OS: lista, grade, Kanban

### Fase 3 — IA Opcional
- [ ] Sugestão de prioridade de tickets (histórico)
- [ ] Previsão de falhas em equipamentos
- [ ] Chat inteligente de suporte interno

## Arquitetura em Camadas (Backend)
- src/controllers
- src/routes
- src/services
- src/repositories
- src/middlewares
- src/utils
- src/validators
- src/docs
- src/server.ts

## Convenções
- Linguagem: TypeScript
- Framework: React (frontend) / Express (backend)
- ORM: Prisma
- Gerenciador: pnpm
- Processos: PM2
- Ambiente: dotenv
- Auth: JWT + bcrypt
- Docs: Swagger
- Padronização: ESLint
- Estilização: styled-components
- Organização: Arquitetura em camadas
- Pastas: conforme acima
- Documentação: README.md
- Envio: GitHub
- Versões: mais recentes
- Animação: framer-motion
- Proteção de rotas: react-router-dom
- Tipagem: TypeScript, sem any
- Hooks de API: criar useApi para acesso limpo à API
- camelCase para arquivos, funções e variáveis
- Comentários em português BR explicando funções

## Execução
1. Configure .env a partir de .env.example
2. Instale dependências: pnpm install
3. Backend: pnpm --filter backend dev
4. Frontend: pnpm --filter frontend dev
5. Documentação Swagger disponível em /docs

## API do Portal do Cliente (para o Frontend)
- Base: `/api/client`
- Autenticação: Bearer JWT (`Authorization: Bearer <token>`) via `clientAuthMiddleware`
- Formato: `Content-Type: application/json`

### Autenticação do Cliente
- `POST /api/client/auth/register` — registrar cliente
- `POST /api/client/auth/login` — autenticar e receber token
- `POST /api/client/auth/forgot-password` — iniciar recuperação
- `POST /api/client/auth/reset-password` — concluir recuperação
- `GET /api/client/auth/profile` — dados do cliente autenticado

### Perfil do Cliente
- `PUT /api/client/profile` — atualizar preferências do cliente

### Ordens de Serviço (Cliente)
- `POST /api/client/service-orders` — abrir OS; body: `title`, `description`, `scheduledDate?`
- `GET /api/client/service-orders` — listar; query: `page`, `limit`, `status?`
- `GET /api/client/service-orders/:id` — detalhes
- `PUT /api/client/service-orders/:id` — atualizar campos do cliente
- `POST /api/client/service-orders/:id/comments` — comentar; body: `content`
- `POST /api/client/service-orders/:id/qualification` — qualificar; body: `rating (1-5)`, `feedback?`
- `POST /api/client/service-orders/:id/attachments` — upload de anexos (pendente)

### Tickets (Cliente)
- `POST /api/client/tickets` — abrir ticket; body: `title`, `description`, `priority`
- `GET /api/client/tickets` — listar; query: `page`, `limit`, `status?`, `priority?`, `search?`
- `GET /api/client/tickets/:id` — detalhes com comentários
- `POST /api/client/tickets/:id/comments` — comentar; body: `content`
- `POST /api/client/tickets/:id/attachments` — upload de anexos (pendente)

## Páginas do Frontend (Portal do Cliente)
- Login e recuperação de senha → `auth/*`
- Dashboard do cliente → cards de OS/tickets, prazos e SLAs
- Minhas Ordens de Serviço → lista, detalhe, abrir, comentários, qualificar, anexos (pendente)
- Meus Tickets → lista, detalhe, abrir, comentários, anexos (pendente)
- Perfil e Preferências → `GET /api/client/auth/profile`, `PUT /api/client/profile`
- Notificações (futuro) → listar e marcar como lida (pendente)

## Convenções de Consumo da API
- Header `Authorization: Bearer <token>` obrigatório nas rotas de cliente (exceto register/login/forgot/reset)
- Paginação: usar `page` e `limit` nas listas; responses retornam metadados de paginação
- Escopo: dados sempre filtrados por `providerId` do cliente
- Validação: Zod aplicada nos endpoints; seguir formatos descritos acima