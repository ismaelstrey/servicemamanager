# Usuários

Gerência de usuários com CRUD, roles e reset de senha.

## Backend
- Rotas: `/api/users`.
- Validações, regras de negócio e hash com `bcrypt`.
- Autorização por role via JWT.

## Frontend
- Página `/users` com lista e formulário.
- Hook `useUsers` para acesso à API.
- Proteção de rota para admin.