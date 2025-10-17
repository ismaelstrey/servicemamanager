# Sistema de Gerenciamento de Provedores com Workspace Inteligente

Este repositório contém um projeto fullstack (frontend React + backend Express/Prisma) para gerenciar provedores de internet com workspaces dedicados, atendendo às regras do projeto.

Componentes principais:
- Frontend: React + TypeScript + Vite, styled-components (com suporte a temas), react-router-dom, framer-motion.
- Backend: Express + TypeScript, Prisma (PostgreSQL), JWT + bcrypt, Swagger.
- Gerenciamento: pnpm (workspaces), PM2, ESLint, dotenv.

Roadmap resumido:
1) Infraestrutura e boilerplate (pnpm workspace, ESLint, styled-components, Express).
2) Autenticação (JWT): login, registro, refresh token, proteção de rotas.
3) Domínio: provedores, equipamentos, tickets, cofre de senhas, workspaces.
4) Dashboard por provedor: métricas, links, inventário, tickets.
5) Visualizações de OS: lista, grade, Kanban.
6) Documentação: Swagger, guias de uso, convenções.
7) Observabilidade e melhorias (logs, métricas, IA opcional).

Consulte o arquivo projeto.md para especificações e documentação detalhada.