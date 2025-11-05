# Visão Geral

Este documento fornece uma visão geral da arquitetura, padrões e fluxos principais do sistema TelecomAI.

- Linguagem: TypeScript
- Frontend: React + Tailwind v4 + framer-motion
- Backend: Node + Express + Prisma
- Autenticação: JWT + bcrypt
- Documentação: Swagger
- Processos: PM2
- Dependências: pnpm
- Organização: Arquitetura em camadas (controllers, routes, services, repositories, middlewares, utils, validators, docs)

## Fluxos Principais
- Login e autorização por role
- Tickets e Ordens de Serviço
- Relatórios e métricas
- Configurações do sistema
- Integrações (WhatsApp Evolution/Cloud, Telegram)

## Boas Práticas
- Hooks para acesso à API no frontend
- Tipagem estrita e sem `any`
- Comentários explicativos em pt-BR
- Padronização via ESLint