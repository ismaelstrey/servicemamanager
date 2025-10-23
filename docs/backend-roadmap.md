# Roadmap do Backend - Sistema de Gerenciamento de Provedores

## 📋 Visão Geral
Sistema backend para gerenciamento de provedores de internet com workspaces dedicados, desenvolvido em Node.js + TypeScript + Prisma + PostgreSQL.

---

## ✅ **FASE 1: FUNDAÇÃO E AUTENTICAÇÃO** (CONCLUÍDA)

### 🟢 Estrutura Base Implementada
- [x] Configuração do projeto TypeScript
- [x] Estrutura de pastas (controllers, routes, services, repositories, middlewares, utils, validators)
- [x] Configuração do Prisma ORM
- [x] Configuração do servidor Express
- [x] Middlewares básicos (CORS, JSON parser)
- [x] Configuração de variáveis de ambiente (.env)

### 🟢 Sistema de Autenticação
- [x] Model User no Prisma
- [x] AuthController (register, login)
- [x] AuthService (lógica de negócio)
- [x] AuthRoutes (endpoints /auth/register, /auth/login)
- [x] UserRepository (acesso a dados)
- [x] Validadores Zod (authValidators)
- [x] Utilitários JWT (jwtUtils)
- [x] Utilitários de senha (passwordUtils, bcrypt)
- [x] Middleware de autenticação (authMiddleware)

### 🟢 Banco de Dados
- [x] Schema Prisma básico com models: User, Provider, Equipment, Ticket, PasswordVault
- [x] Relacionamentos entre entidades
- [x] Configuração PostgreSQL

---

## 🚧 **FASE 2: GESTÃO DE PROVEDORES** (CONCLUÍDA - núcleo)

### 🟡 Controllers e Endpoints
- [x] ProviderController
  - [x] POST /api/providers (criar provedor)
  - [x] GET /api/providers (listar provedores)
  - [x] GET /api/providers/:id (detalhes do provedor)
  - [x] PUT /api/providers/:id (atualizar provedor)
  - [x] DELETE /api/providers/:id (remover provedor)
  - [x] PATCH /api/providers/:id/status (ativar/desativar)
  - [x] GET /api/providers/:id/stats (estatísticas)
  - [x] POST /api/providers/:id/invite (convidar usuário)
  - [x] GET /api/providers/:id/users (listar usuários)
  - [x] PUT /api/providers/:id/settings (atualizar configurações)
  - [x] GET /api/providers/check-workspace/:workspace (verificar disponibilidade)
  - [x] GET /api/providers/workspace/:workspace (buscar por workspace)

### 🟢 Services e Repositories
- [x] ProviderService (lógica de negócio)
- [x] ProviderRepository (acesso a dados)
- [x] Validadores para Provider (providerValidator)

### 🟢 Rotas
- [x] providerRoutes registradas em `\api\providers`
- [x] Protegidas por `authMiddleware` e validadas com Zod

### 🟡 Funcionalidades Específicas
- [ ] Geração automática de workspace único (atual: verificação de disponibilidade)
- [x] Validação de CNPJ (validator)
- [x] Sistema de permissões básico por provedor (verificação de acesso por usuário e papéis; regras finas pendentes)

---

## 🚧 **FASE 3: GESTÃO DE EQUIPAMENTOS** (EM PROGRESSO)

### 🟢 Controllers e Endpoints
- [x] EquipmentController
  - [x] POST /api/providers/:providerId/equipments (cadastrar equipamento; aceita `status`)
  - [x] GET /api/providers/:providerId/equipments (listar equipamentos; suporta filtro `status` e `type`)
  - [x] GET /api/providers/equipments/:id (detalhes do equipamento)
  - [x] PUT /api/providers/equipments/:id (atualizar equipamento; permite atualizar `status`)
  - [x] DELETE /api/providers/equipments/:id (remover equipamento)
  - [x] GET /api/providers/:providerId/equipments/stats (estatísticas)

### 🟢 Tipos de Equipamentos
- [x] Enum canônico `EquipmentType` no Prisma
- Valores: `switch`, `olt`, `router`, `server`, `virtualizer`, `other`
- [x] Filtro por `type` na listagem de equipamentos

### 🟢 Services e Repositories
- [x] EquipmentService
- [x] EquipmentRepository
- [x] equipmentValidators

### 🟢 Rotas
- [x] equipmentRoutes registradas em `/api/providers`
- [x] Protegidas por `authMiddleware` e validadas com Zod (`providerId` params, `list` query com `status`, `create` body com `status`, `id` param, `update` body com `status`)

### 🟢 Validação (sem testes automatizados)
- [x] Smoke test manual: registrar usuário, criar provedor, criar e listar equipamentos

### 🟡 Funcionalidades Avançadas
- [x] Controle de serial único
- [x] Categorização por tipo — Prisma enum `EquipmentType` e validação Zod implementados
- [x] Status do equipamento (ativo/inativo/manutenção) — Prisma enum `EquipmentStatus` e coluna `status` adicionada ao model `Equipment` (default `active`)
- [ ] Histórico de alterações

---

## 🚧 **FASE 4: SISTEMA DE TICKETS** (CONCLUÍDA - núcleo)

### 🟢 Controllers e Endpoints
- [x] TicketController
  - [x] POST /api/providers/:providerId/tickets (criar ticket)
  - [x] GET /api/providers/:providerId/tickets (listar tickets)
  - [x] GET /api/tickets/:id (detalhes do ticket)
  - [x] PUT /api/tickets/:id (atualizar ticket)
  - [x] PUT /api/tickets/:id/status (alterar status)
  - [x] DELETE /api/tickets/:id (remover ticket)
  - [x] GET /api/providers/:providerId/tickets/stats (estatísticas)

### 🟢 Sistema de Status
- [x] Aberto (open)
- [x] Em andamento (in_progress)
- [x] Aguardando cliente (waiting_client)
- [x] Resolvido (resolved)
- [x] Fechado (closed)

### 🟢 Sistema de Prioridades
- [x] Baixa (low)
- [x] Média (medium)
- [x] Alta (high)
- [x] Crítica (critical)

### 🟢 Services e Repositories
- [x] TicketService
- [x] TicketRepository
- [x] ticketValidators

### 🟡 Funcionalidades Avançadas
- [ ] Vinculação automática ao provedor
- [ ] Sistema de comentários/atualizações
- [ ] Notificações de mudança de status
- [ ] Filtros avançados (status, prioridade, data)

---

## 🚧 **FASE 5: COFRE DE SENHAS** (PRÓXIMA ETAPA - planejamento)

### 🟡 Controllers e Endpoints
- [ ] PasswordVaultController
  - [ ] POST /api/providers/:providerId/passwords (adicionar senha)
  - [ ] GET /api/providers/:providerId/passwords (listar senhas)
  - [ ] GET /api/passwords/:id (detalhes da senha)
  - [ ] PUT /api/passwords/:id (atualizar senha)
  - [ ] DELETE /api/passwords/:id (remover senha)

### 🟡 Segurança
- [ ] Criptografia de senhas com AES-256 (armazenamento seguro)
- [ ] Controle de acesso por usuário e por provedor (RBAC básico)
- [ ] Log de acessos às senhas (auditoria)
- [ ] Expiração e rotação de senhas

### 🟡 Services e Repositories
- [ ] PasswordVaultService
- [ ] PasswordVaultRepository
- [ ] passwordVaultValidators
- [ ] encryptionUtils (helpers de criptografia)

### 🟡 Rotas e Validação
- [ ] passwordVaultRoutes registradas em `/api/providers`
- [ ] Protegidas por `authMiddleware` e validadas com Zod (`providerId`, `id`, corpo com campos criptografados)

---

## 🚧 **FASE 6: DASHBOARD E RELATÓRIOS** (PENDENTE)

### 🔴 Controllers de Dashboard
- [ ] DashboardController
  - [ ] GET /providers/:providerId/dashboard (dados completos)
  - [ ] GET /providers/:providerId/stats/equipments (estatísticas de equipamentos)
  - [ ] GET /providers/:providerId/stats/tickets (estatísticas de tickets)
  - [ ] GET /providers/:providerId/stats/passwords (estatísticas do cofre)

### 🔴 Métricas Implementadas
- [ ] Quantidade total de equipamentos por tipo
- [ ] Tickets abertos vs resolvidos
- [ ] Tempo médio de resolução
- [ ] Equipamentos por status
- [ ] Senhas por categoria

### 🔴 Services
- [ ] DashboardService
- [ ] ReportsService

---

## 🚧 **FASE 7: SISTEMA DE ORDENS DE SERVIÇO** (PENDENTE)

### 🔴 Novo Model no Prisma
- [ ] ServiceOrder (ordem de serviço)
  - [ ] Relacionamento com Provider
  - [ ] Relacionamento com Ticket (opcional)
  - [ ] Status workflow
  - [ ] Campos de execução

### 🔴 Controllers e Endpoints
- [ ] ServiceOrderController
  - [ ] POST /providers/:providerId/service-orders
  - [ ] GET /providers/:providerId/service-orders
  - [ ] GET /service-orders/:id
  - [ ] PUT /service-orders/:id
  - [ ] PUT /service-orders/:id/status

### 🔴 Visualizações
- [ ] Lista (endpoint com paginação)
- [ ] Grade (endpoint com agrupamento)
- [ ] Kanban (endpoint por status)

---

## 🚧 **FASE 8: MELHORIAS E OTIMIZAÇÕES** (PENDENTE)

### 🔴 Performance
- [ ] Implementar cache Redis
- [ ] Otimização de queries Prisma
- [ ] Paginação em todos os endpoints
- [ ] Índices no banco de dados

### 🔴 Segurança
- [ ] Rate limiting
- [ ] Validação de entrada mais rigorosa
- [ ] Logs de auditoria
- [ ] Sanitização de dados

### 🔴 Documentação
- [ ] Swagger/OpenAPI completo
- [ ] Documentação de APIs
- [ ] Guias de desenvolvimento

---

## 🚧 **FASE 9: FUNCIONALIDADES COM IA** (OPCIONAL)

### 🔴 Análise Inteligente
- [ ] Sugestão de prioridade de tickets
  - [ ] Modelo de ML para análise histórica
  - [ ] API de classificação automática
  - [ ] Treinamento com dados históricos

### 🔴 Previsão de Falhas
- [ ] Monitoramento de equipamentos
- [ ] Algoritmos de predição
- [ ] Alertas preventivos

### 🔴 Chat Inteligente
- [ ] Integração com LLM
- [ ] Base de conhecimento
- [ ] Suporte contextual

---

## 📊 **RESUMO DO PROGRESSO**

### ✅ Concluído (40%)
- Estrutura base do projeto
- Sistema de autenticação completo
- Configuração do banco de dados
- Models básicos no Prisma
- Gestão de provedores: Controller, Service, Repository, Validators, Rotas
- Gestão de equipamentos: endpoints de criar/listar e rotas protegidas
- Sistema de tickets: Controller, Service, Repository, Validators, Rotas

### 🚧 Em Desenvolvimento (Gestão de Equipamentos e Provedores)
- Equipamentos: detalhes, atualização, remoção e estatísticas
- Ajustes de permissões por papel (regras finas por provedor)
- Geração automática de workspace (Provedores)
- Estatísticas e métricas adicionais (Provedores)

### 🔴 Pendente (60%)
- Cofre de senhas
- Dashboard e relatórios
- Ordens de serviço
- Melhorias e otimizações
- Funcionalidades com IA

---

## 🎯 **PRÓXIMOS PASSOS RECOMENDADOS**

1. Finalizar endpoints de Equipment: GET/PUT/DELETE e stats
2. Implementar Cofre de Senhas: Repository, Service, Controller, Validators, Rotas
3. Adicionar `encryptionUtils` com AES-256-GCM e configurar `ENCRYPTION_KEY`
4. Definir RBAC para leitura descriptografada e auditoria de acessos
5. Migrar `PasswordVault` para armazenar `iv` e `authTag` (ou formato seguro combinado)
6. Melhorar paginação e filtros (search, type)
7. Preparar migrações e seed (se necessário)
8. Documentar endpoints no Swagger

---

## 🛠️ **TECNOLOGIAS UTILIZADAS**

- **Runtime**: Node.js
- **Linguagem**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco**: PostgreSQL
- **Autenticação**: JWT + bcrypt
- **Validação**: Zod
- **Documentação**: Swagger (planejado)
- **Gerenciador**: pnpm
- **Processo**: PM2

---

*Roadmap atualizado em: Outubro 2025*
*Status: 40% concluído - Autenticação finalizada; núcleo de Provedores concluído; Equipamentos iniciado; Tickets concluídos (núcleo)*
### 🟢 Tipos de Equipamentos
- [x] Enum canônico `EquipmentType` no Prisma
- Valores: `switch`, `olt`, `router`, `server`, `virtualizer`, `other`
- Filtro por `type` na listagem de equipamentos
- [x] Categorização por tipo — Prisma enum `EquipmentType` e validação Zod implementados
- [x] Status do equipamento (ativo/inativo/manutenção) — Prisma enum `EquipmentStatus` e coluna `status` adicionada ao model `Equipment` (default `active`)
- [ ] Histórico de alterações

---

## 🚧 **FASE 4: SISTEMA DE TICKETS** (CONCLUÍDA - núcleo)

### 🟢 Controllers e Endpoints
- [x] TicketController
  - [x] POST /api/providers/:providerId/tickets (criar ticket)
  - [x] GET /api/providers/:providerId/tickets (listar tickets)
  - [x] GET /api/tickets/:id (detalhes do ticket)
  - [x] PUT /api/tickets/:id (atualizar ticket)
  - [x] PUT /api/tickets/:id/status (alterar status)
  - [x] DELETE /api/tickets/:id (remover ticket)
  - [x] GET /api/providers/:providerId/tickets/stats (estatísticas)

### 🟢 Sistema de Status
- [x] Aberto (open)
- [x] Em andamento (in_progress)
- [x] Aguardando cliente (waiting_client)
- [x] Resolvido (resolved)
- [x] Fechado (closed)

### 🟢 Sistema de Prioridades
- [x] Baixa (low)
- [x] Média (medium)
- [x] Alta (high)
- [x] Crítica (critical)

### 🟢 Services e Repositories
- [x] TicketService
- [x] TicketRepository
- [x] ticketValidators

### 🟡 Funcionalidades Avançadas
- [ ] Vinculação automática ao provedor
- [ ] Sistema de comentários/atualizações
- [ ] Notificações de mudança de status
- [ ] Filtros avançados (status, prioridade, data)

---

## 🚧 **FASE 5: COFRE DE SENHAS** (PENDENTE)

### 🔴 Controllers e Endpoints
- [ ] PasswordVaultController
  - [ ] POST /providers/:providerId/passwords (adicionar senha)
  - [ ] GET /providers/:providerId/passwords (listar senhas)
  - [ ] GET /passwords/:id (detalhes da senha)
  - [ ] PUT /passwords/:id (atualizar senha)
  - [ ] DELETE /passwords/:id (remover senha)

### 🔴 Segurança
- [ ] Criptografia de senhas (AES-256)
- [ ] Controle de acesso por usuário
- [ ] Log de acessos às senhas
- [ ] Expiração de senhas

### 🔴 Services e Repositories
- [ ] PasswordVaultService
- [ ] PasswordVaultRepository
- [ ] passwordVaultValidators
- [ ] Utilitários de criptografia (encryptionUtils)

---

## 🚧 **FASE 6: DASHBOARD E RELATÓRIOS** (PENDENTE)

### 🔴 Controllers de Dashboard
- [ ] DashboardController
  - [ ] GET /providers/:providerId/dashboard (dados completos)
  - [ ] GET /providers/:providerId/stats/equipments (estatísticas de equipamentos)
  - [ ] GET /providers/:providerId/stats/tickets (estatísticas de tickets)
  - [ ] GET /providers/:providerId/stats/passwords (estatísticas do cofre)

### 🔴 Métricas Implementadas
- [ ] Quantidade total de equipamentos por tipo
- [ ] Tickets abertos vs resolvidos
- [ ] Tempo médio de resolução
- [ ] Equipamentos por status
- [ ] Senhas por categoria

### 🔴 Services
- [ ] DashboardService
- [ ] ReportsService

---

## 🚧 **FASE 7: SISTEMA DE ORDENS DE SERVIÇO** (PENDENTE)

### 🔴 Novo Model no Prisma
- [ ] ServiceOrder (ordem de serviço)
  - [ ] Relacionamento com Provider
  - [ ] Relacionamento com Ticket (opcional)
  - [ ] Status workflow
  - [ ] Campos de execução

### 🔴 Controllers e Endpoints
- [ ] ServiceOrderController
  - [ ] POST /providers/:providerId/service-orders
  - [ ] GET /providers/:providerId/service-orders
  - [ ] GET /service-orders/:id
  - [ ] PUT /service-orders/:id
  - [ ] PUT /service-orders/:id/status

### 🔴 Visualizações
- [ ] Lista (endpoint com paginação)
- [ ] Grade (endpoint com agrupamento)
- [ ] Kanban (endpoint por status)

---

## 🚧 **FASE 8: MELHORIAS E OTIMIZAÇÕES** (PENDENTE)

### 🔴 Performance
- [ ] Implementar cache Redis
- [ ] Otimização de queries Prisma
- [ ] Paginação em todos os endpoints
- [ ] Índices no banco de dados

### 🔴 Segurança
- [ ] Rate limiting
- [ ] Validação de entrada mais rigorosa
- [ ] Logs de auditoria
- [ ] Sanitização de dados

### 🔴 Documentação
- [ ] Swagger/OpenAPI completo
- [ ] Documentação de APIs
- [ ] Guias de desenvolvimento

---

## 🚧 **FASE 9: FUNCIONALIDADES COM IA** (OPCIONAL)

### 🔴 Análise Inteligente
- [ ] Sugestão de prioridade de tickets
  - [ ] Modelo de ML para análise histórica
  - [ ] API de classificação automática
  - [ ] Treinamento com dados históricos

### 🔴 Previsão de Falhas
- [ ] Monitoramento de equipamentos
- [ ] Algoritmos de predição
- [ ] Alertas preventivos

### 🔴 Chat Inteligente
- [ ] Integração com LLM
- [ ] Base de conhecimento
- [ ] Suporte contextual

---

## 📊 **RESUMO DO PROGRESSO**

### ✅ Concluído (40%)
- Estrutura base do projeto
- Sistema de autenticação completo
- Configuração do banco de dados
- Models básicos no Prisma
- Gestão de provedores: Controller, Service, Repository, Validators, Rotas
- Gestão de equipamentos: endpoints de criar/listar e rotas protegidas
- Sistema de tickets: Controller, Service, Repository, Validators, Rotas

### 🚧 Em Desenvolvimento (Gestão de Equipamentos e Provedores)
- Equipamentos: detalhes, atualização, remoção e estatísticas
- Ajustes de permissões por papel (regras finas por provedor)
- Geração automática de workspace (Provedores)
- Estatísticas e métricas adicionais (Provedores)

### 🔴 Pendente (60%)
- Cofre de senhas
- Dashboard e relatórios
- Ordens de serviço
- Melhorias e otimizações
- Funcionalidades com IA

---

## 🎯 **PRÓXIMOS PASSOS RECOMENDADOS**

1. Implementar GET/PUT/DELETE para Equipment e endpoint de stats
2. Adicionar campo de status para equipamentos e migração
3. Definir enum de tipos de equipamentos e validação
4. Melhorar paginação e filtros (search, type)
5. Preparar migrações e seed de equipamentos (se necessário)
6. Documentar endpoints no Swagger

---

## 🛠️ **TECNOLOGIAS UTILIZADAS**

- **Runtime**: Node.js
- **Linguagem**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco**: PostgreSQL
- **Autenticação**: JWT + bcrypt
- **Validação**: Zod
- **Documentação**: Swagger (planejado)
- **Gerenciador**: pnpm
- **Processo**: PM2

---

*Roadmap atualizado em: Outubro 2025*
*Status: 40% concluído - Autenticação finalizada; núcleo de Provedores concluído; Equipamentos iniciado; Tickets concluídos (núcleo)*