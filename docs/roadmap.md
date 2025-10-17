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