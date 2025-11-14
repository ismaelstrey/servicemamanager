## Objetivo
- Estender o modelo de Provedor com telefone, e-mail e filiais.
- Criar catálogo de serviços do provedor (Zabbix, Proxmox, Grafana, ERP etc.) com múltiplas credenciais por serviço.
- Implementar privacidade e controle de acesso granular (público/privado/por grupos/usuários) às credenciais.
- Expor endpoints REST com documentação Swagger.

## Modelagem (Prisma)
### Provider
- Campos: `phone`, `email`.
- Relações: `branches: ProviderBranch[]`, `services: ProviderService[]`, `groups: ProviderGroup[]`.

### ProviderBranch
- `id`, `providerId`, `name`, `phone?`, `email?`, `address: { street, number, complement?, district, city, state, zip }`, `notes?`, `createdAt`, `updatedAt`.

### ProviderService
- `id`, `providerId`, `name`, `type: enum('zabbix','proxmox','grafana','erp','other')`, `url`, `description?`, `isActive: boolean`, `createdAt`, `updatedAt`.
- Relação: `credentials: ProviderServiceCredential[]`.

### ProviderServiceCredential
- `id`, `serviceId`, `label?` (ex.: "Acesso NOC"), `username`, `passwordEnc` (criptografado), `isActive: boolean`, `visibility: enum('PUBLIC','PROVIDER_ONLY','CUSTOM')`, `createdAt`, `updatedAt`.
- Controle de acesso CUSTOM: `allowedUsers: CredentialUserAccess[]`, `allowedGroups: CredentialGroupAccess[]`.

### ProviderGroup
- `id`, `providerId`, `name`, `description?`, `createdAt`, `updatedAt`.
- Relações: `members: ProviderGroupMember[]`.

### ProviderGroupMember
- `groupId`, `providerUserId` (aponta para `ProviderUser`) — pivot N:N.

### CredentialUserAccess / CredentialGroupAccess
- `credentialId`, `providerUserId` / `groupId` — pivots para visibilidade customizada.

### Segurança (armazenamento de senha)
- Criptografia simétrica (AES-GCM) em `passwordEnc` com IV aleatório.
- Chave em `.env` (`CREDENTIALS_ENCRYPTION_KEY` 32 bytes base64). Nunca logar senhas.

## Serviços
- `CredentialService`: criptografar/descriptografar, mascarar quando usuário não tem acesso, validar visibilidade.
- `ServiceCatalogService`: CRUD de serviços e suas credenciais, filtro por `isActive` e escopo do usuário.
- `BranchService`: CRUD de filiais.
- Reuso de `ProviderService`/`ProviderUser` para verificações de escopo.

## Endpoints e Swagger
### Branches (Filiais)
- `POST /api/providers/{providerId}/branches` — criar
- `GET /api/providers/{providerId}/branches` — listar
- `GET /api/providers/branches/{id}` — detalhar
- `PATCH /api/providers/branches/{id}` — atualizar
- `DELETE /api/providers/branches/{id}` — remover

### Services (Catálogo)
- `POST /api/providers/{providerId}/services` — criar serviço
- `GET /api/providers/{providerId}/services` — listar ativos/inativos
- `GET /api/providers/services/{id}` — detalhar
- `PATCH /api/providers/services/{id}` — atualizar
- `DELETE /api/providers/services/{id}` — remover

### Credentials (Credenciais por serviço)
- `POST /api/providers/services/{serviceId}/credentials` — criar credencial (label, username, password, visibility, isActive)
- `GET /api/providers/services/{serviceId}/credentials` — listar credenciais do serviço (aplica controle de acesso e máscara)
- `GET /api/providers/credentials/{id}` — detalhar (se autorizado)
- `PATCH /api/providers/credentials/{id}` — atualizar (inclui alterar visibilidade e vínculos de acesso)
- `DELETE /api/providers/credentials/{id}` — remover
- Vínculos de acesso (CUSTOM):
  - `POST /api/providers/credentials/{id}/access/users` — `{ userIds: number[] }`
  - `POST /api/providers/credentials/{id}/access/groups` — `{ groupIds: number[] }`
  - `DELETE /api/providers/credentials/{id}/access/users/{providerUserId}`
  - `DELETE /api/providers/credentials/{id}/access/groups/{groupId}`

### Groups (opcional para controle)
- `POST /api/providers/{providerId}/groups`, `GET .../groups`, `POST /api/providers/groups/{id}/members`, `DELETE .../members/{providerUserId}`

### Área do Cliente
- `GET /api/client/services` — lista serviços `isActive` do provedor do cliente com URLs.
- `GET /api/client/services/{serviceId}/credentials` — lista credenciais permitidas ao cliente (aplica visibilidade; `PROVIDER_ONLY` não aparece).

### Swagger
- Tags: `Providers`, `Branches`, `Services`, `Credentials`, `Groups`, `Client Services`.
- Schemas: `ProviderBranch`, `ProviderService`, `ProviderServiceCredential` (com `password` somente em resposta quando autorizado; caso contrário mascarado), `ProviderGroup`, `ProviderGroupMember`.
- Exemplos: criação de credencial com `visibility: 'CUSTOM'` e vinculação por usuários/grupos.

## Validações (zod)
- Branch: endereço com CEP/UF válidos, `phone` e `email` opcionais validados.
- Service: `type` enum, `url` válido, `isActive` boolean.
- Credential: `username` string, `password` string (criptografado internamente), `visibility` enum, `isActive` boolean.
- Access: arrays de IDs inteiros positivos.

## Controle de Acesso
- JWT obrigatório; verificação de `providerId` do usuário.
- Credenciais:
  - `PUBLIC`: qualquer usuário autenticado do provedor vê (cliente vê via endpoint client se permitido).
  - `PROVIDER_ONLY`: visível apenas para usuários internos (não cliente).
  - `CUSTOM`: somente usuários/grupos vinculados.

## Segurança
- Criptografia de `password` em repouso, chave em `.env`.
- Mascaramento ao listar (`••••••`), exibir texto claro apenas em `GET credentials/{id}` para usuários autorizados.
- Auditar criação/alteração/visualização de credenciais.

## Migração
- Alterar `Provider` (add `phone`, `email`).
- Criar tabelas: `ProviderBranch`, `ProviderService`, `ProviderServiceCredential`, `ProviderGroup`, `ProviderGroupMember`, `CredentialUserAccess`, `CredentialGroupAccess`.
- Gerar/migrar Prisma.

## Implementação (Camadas)
- Repositórios, Serviços, Controllers, Rotas, Validators, Swagger.
- Reuso de `cacheMiddleware` em listagens; sem cache para endpoints que retornam senha em claro.

## Critérios de Aceite
- Filiais CRUD funcionando e validadas.
- Serviços CRUD com `isActive` e URL.
- Credenciais com múltiplos registros por serviço, visibilidade e controle por usuários/grupos.
- Área do cliente exibe somente serviços ativos e credenciais conforme visibilidade.
- Senhas criptografadas, sem logs sensíveis.

## Próximos Passos
- Implementar passos acima e documentar no Swagger.
- Opcional: rotação de credenciais e expiração, exportação segura (auditada).

Confirma para iniciar a implementação dessas alterações?