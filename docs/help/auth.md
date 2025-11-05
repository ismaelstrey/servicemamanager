# Autenticação

Detalhes sobre autenticação JWT, fluxo de login, refresh e proteção de rotas.

## Backend
- Middleware `verifyToken` protege rotas.
- Endpoints: `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`.
- Hash de senhas com `bcrypt`.

## Frontend
- `AuthContext` e `useAuth` para estado e ações.
- `ProtectedRoute` para rotas protegidas.
- Armazenamento seguro do token (memory/localStorage conforme necessidade).