## Objetivo
- Estender Provider com `phone` e `email`, criar filiais (branches), catálogo de serviços e credenciais com visibilidade e controle de acesso por usuários/grupos.
- Expor endpoints REST com validação (zod) e documentar no Swagger.

## Alterações de Banco (Prisma)
### Provider
- Add campos: `phone?: String`, `email?: String`.
- Relações: `branches: ProviderBranch[]`, `services: ProviderService[]`, `groups: ProviderGroup[]`.

### Novos Modelos
- ProviderBranch: `id`, `providerId`, `name`, `phone?`, `email?`, `address { street, number, complement?, district, city, state, zip }` (pode ser `Json` ou campos separados), `notes?`, timestamps.
- ProviderService: `id`, `providerId`, `name`, `type: enum('zabbix','proxmox','grafana','erp','other')`, `url`, `description?`, `isActive`, timestamps; relação `credentials: ProviderServiceCredential[]`.
- ProviderServiceCredential: `id`, `serviceId`, `label?`, `username`, `passwordEnc` (criptografado), `isActive`, `visibility: enum('PUBLIC','PROVIDER_ONLY','CUSTOM')`, timestamps; relações `allowedUsers`, `allowedGroups`.
- ProviderGroup: `id`, `providerId`, `name`, `description?`, timestamps; relação `members: ProviderGroupMember[]`.
- ProviderGroupMember: pivot N:N — `groupId`, `providerUserId` (aponta para `ProviderUser`).
- CredentialUserAccess: pivot — `credentialId`, `providerUserId`.
- CredentialGroupAccess: pivot — `credentialId`, `groupId`.

## Serviços de Domínio
- CredentialService:
  - Criptografia AES‑GCM 256 (`crypto`), chave em `.env` `CREDENTIALS_ENCRYPTION_KEY` (base64 32 bytes).
  - `encrypt(password: string) -> passwordEnc`, `decrypt(passwordEnc) -> string`.
  - `canView(credential, user)`: aplica `visibility` e checa pivots.
  - `mask(passwordEnc)`: retorna `••••••` quando sem acesso.
- ServiceCatalogService: CRUD de serviços e credenciais; lista aplicando `canView` e `mask`.
- BranchService: CRUD de filiais.

## Endpoints e Fluxos
### Branches
- POST `/api/providers/{providerId}/branches` — criar filial.
- GET `/api/providers/{providerId}/branches` — listar filiais.
- GET `/api/providers/branches/{id}` — detalhar.
- PATCH `/api/providers/branches/{id}` — atualizar.
- DELETE `/api/providers/branches/{id}` — remover.

### Services
- POST `/api/providers/{providerId}/services` — criar serviço.
- GET `/api/providers/{providerId}/services?isActive=true|false` — listar.
- GET `/api/providers/services/{id}` — detalhar.
- PATCH `/api/providers/services/{id}` — atualizar.
- DELETE `/api/providers/services/{id}` — remover.

### Credentials
- POST `/api/providers/services/{serviceId}/credentials` — `{ label?, username, password, visibility, isActive }` (criptografa internamente).
- GET `/api/providers/services/{serviceId}/credentials` — lista credenciais aplicando visibilidade; senha mascarada para não autorizados.
- GET `/api/providers/credentials/{id}` — detalhar, exibe senha descriptografada apenas se `canView`.
- PATCH `/api/providers/credentials/{id}` — atualizar (inclui `visibility` e `isActive`).
- DELETE `/api/providers/credentials/{id}` — remover.
- Acesso custom:
  - POST `/api/providers/credentials/{id}/access/users` — `{ userIds: number[] }`.
  - POST `/api/providers/credentials/{id}/access/groups` — `{ groupIds: number[] }`.
  - DELETE `/api/providers/credentials/{id}/access/users/{providerUserId}`.
  - DELETE `/api/providers/credentials/{id}/access/groups/{groupId}`.

### Groups (opcional)
- POST `/api/providers/{providerId}/groups`, GET `/api/providers/{providerId}/groups`.
- POST `/api/providers/groups/{id}/members` — `{ providerUserIds: number[] }`.
- DELETE `/api/providers/groups/{id}/members/{providerUserId}`.

### Área do Cliente
- GET `/api/client/services` — lista serviços ativos do provedor do cliente com `name`, `type`, `url`.
- GET `/api/client/services/{serviceId}/credentials` — lista credenciais visíveis para clientes (`PUBLIC` e `CUSTOM` se permitido; nunca `PROVIDER_ONLY`). Senhas mascaradas.

## Validação (zod)
- Branch: nome, telefone, e-mail; endereço (CEP/UF válidos).
- Service: `type` enum; `url` obrigatória (`https?://`), `isActive` boolean.
- Credential: `username` string; `password` string; `visibility` enum; `isActive` boolean.
- Access: arrays de inteiros positivos.

## Swagger
- Tags: `Branches`, `Services`, `Credentials`, `Groups`, `Client Services`.
- Schemas: `ProviderBranch`, `ProviderService`, `ProviderServiceCredential` (campo `password` apenas quando autorizado), `ProviderGroup`, `ProviderGroupMember`.
- Exemplos de visibilidade `CUSTOM` e alterações de acesso.

## Segurança
- JWT obrigatório; escopo por `providerId` (usuário deve pertencer ao provedor).
- Sem logging de senhas; auditoria de log em create/read/update/delete de credenciais.

## Fases de Implementação
1) Prisma: alterar `Provider` e criar novos modelos + migração.
2) Validators (zod) para branches/services/credentials/groups.
3) Repositories + Services: BranchService, ServiceCatalogService, CredentialService.
4) Controllers + Routes com Swagger.
5) Endpoints client (serviços e credenciais visíveis).
6) Testes manuais e ajustes.

## Critérios de Aceite
- CRUD de filiais e serviços com validações e Swagger.
- Credenciais com visibilidade e acesso por usuários/grupos; senhas criptografadas e mascaradas.
- Endpoints client exibem serviços/credenciais conforme visibilidade.

Posso começar a editar o schema, criar serviços/rotas e documentação seguindo este plano?