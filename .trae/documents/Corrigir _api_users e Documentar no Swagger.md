## Diagnóstico

* Frontend espera `GET /users` retornar array (`UserListItem[]`), mas o backend retorna objeto `{ items, total, page, limit }` — quebra o consumo atual.

* API base no frontend usa `VITE_API_URL` ou default `http://localhost:3000/api`. Backend roda em `4002`. Se `VITE_API_URL` não estiver definido para `http://localhost:4002/api`, haverá erro de conexão.

## Correções (Backend)

* Ajustar `UserController.list` para retornar envelope compatível com `PaginatedResponse`: `data: items` + `pagination` { total, page, limit, totalPages }.

* Adicionar documentação Swagger nas rotas `/api/users` com tag `Users` e descrição dos endpoints (listar, detalhar, criar, atualizar, desativar, reativar).

## Verificações

* Confirmar registro de rotas em `server.ts` (já registrado).

* Validadores e middleware corretos (Zod + `authMiddleware`).

## Observação (Frontend)

* Verificar `VITE_API_URL` apontando para `http://localhost:4002/api`. Se faltar, ajustar `.env.development` (sem alteração de código neste passo).

## Entregáveis

* Código atualizado do controller e comentários Swagger na rota.

* Rotas funcionando com resposta consumível pelo frontend atual.

