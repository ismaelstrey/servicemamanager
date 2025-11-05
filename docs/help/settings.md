# Configurações do Sistema

Central de configurações (gerais, notificações, integrações, segurança).

## Backend
- Entidade `SystemSetting` (Prisma).
- Rotas: `/api/settings` (listar/atualizar).
- Validações por tipo e autorização admin.

## Frontend
- Página `/settings` com seções e inputs tipados.
- Hook `useSettings` para carregar e salvar.