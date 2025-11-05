# Deploy

Guia de deploy do backend e frontend.

## Backend
- Dockerfile com build/runtime separados.
- PM2 para processos em produção.
- `.env` baseado no `backend/.env.example`.
- Prisma: `npx prisma generate` e `npx prisma migrate deploy`.

## Frontend
- Vite build: `pnpm -C frontend build`.
- Configuração de `VITE_API_URL`.