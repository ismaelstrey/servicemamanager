## Objetivo
- Implementar o endpoint REST `/api/users` no backend com CRUD completo, alteração de senha e (des)ativação de usuários, seguindo os padrões do projeto (TypeScript, Express, Prisma, JWT+bcrypt, Zod, Swagger, cache opcional Redis).
- Atualizar `docs/backendStatus.md` documentando a funcionalidade e os endpoints.

## Escopo de Endpoints
- `GET /api/users` — listar usuários com paginação, busca e filtros (role, status).
- `GET /api/users/:id` — obter detalhes do usuário.
- `POST /api/users` — criar usuário (hash de senha com bcrypt, role opcional).
- `PUT /api/users/:id` — atualizar nome, email, role e opcionalmente alterar senha.
- `POST /api/users/:id/disable` — desativar usuário (status inativo).
- `POST /api/users/:id/enable` — reativar usuário.
- (Opcional) `PUT /api/users/:id/password` — alterar senha diretamente (se preferir separar do `PUT` geral).

## Alterações no Prisma (User)
- Adicionar campo `isActive Boolean @default(true)` para suportar (des)ativação global.
- Manter `role String @default("admin")` como está (sem enum neste passo para evitar migração ampla).
- Gerar/migrar Prisma.

## Implementação Técnica
- Repositório (`src/repositories/userRepository.ts`):
  - `list({ page, limit, search, role, isActive, sortBy, sortOrder })` com seleção segura e paginação.
  - `getById(id)`
  - `create({ name, email, passwordHash, role })`
  - `update(id, { name, email, role, passwordHash? })`
  - `setActive(id, isActive)`
- Serviço (`src/services/userService.ts`):
  - Regras de negócio, hashing de senha via `passwordUtils.hashPassword`, validação de duplicidade de email.
  - Normalização de filtros e integração com `paginationHelper`.
- Controller (`src/controllers/userController.ts`):
  - Métodos: `list`, `getById`, `create`, `update`, `disable`, `enable`, (opcional) `changePassword`.
  - Respostas padronizadas e códigos HTTP coerentes.
- Rotas (`src/routes/userRoutes.ts`):
  - Protegidas com `authMiddleware`.
  - `validateQuery`/`validateSchema`/`validateParams` via Zod.
  - Cache opcional para listagem: `listCacheMiddleware()` (TTL curto, invalidação em mutações).
- Validadores (`src/validators/userValidators.ts`):
  - `listUsersSchema` (page, limit, search, role, isActive, sortBy, sortOrder)
  - `createUserSchema` (name, email, password, role?)
  - `updateUserSchema` (name?, email?, password?, role?)
  - `userIdParamSchema`

## Segurança e Acesso
- `authMiddleware` obrigatório em todas as rotas de usuários.
- Verificação de papel `admin` no controller para mutações (criar/atualizar/(des)ativar), mantendo leitura para perfis autorizados.
- Sanitização/validação com Zod.

## Swagger/OpenAPI
- Adicionar anotações Swagger em `userRoutes.ts` no mesmo padrão de `providerRoutes.ts`.
- Atualizar `src/docs/paths.ts`/`swagger.ts` se necessário (tags: Users).

## Registro de Rotas
- `src/server.ts`: registrar `app.use('/api/users', userRoutes)` e, se aplicável, rate limit de criação.

## Documentação
- `docs/backendStatus.md`: adicionar seção “Gerência de Usuários (Admin)” com checklist dos endpoints, validações, cache, segurança e pendências.

## Critérios de Aceite
- Lista paginada com filtros retorna corretamente (200) e valida erros de entrada (400).
- Criação aplica hash de senha e previne emails duplicados.
- Atualização permite alterar dados e senha opcionalmente.
- (Des)ativação reflete no campo `isActive`.
- Swagger documenta payloads, respostas e erros.
- Frontend (`useUsers`) funciona contra estes endpoints: `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `POST /users/:id/disable`.

## Observações
- Sem introduzir novas dependências.
- Manter camelCase e comentários em pt-BR.
- Não expor `password` em responses.
- Invalidação simples de cache da lista após mutações.

## Entregáveis
- Código dos repositórios/serviço/controller/rotas/validadores.
- Registro das rotas no servidor.
- Migração Prisma (`isActive` em User).
- Swagger atualizado.
- `backendStatus.md` atualizado com progresso e endpoints.
