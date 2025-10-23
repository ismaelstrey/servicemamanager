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

## 🚧 **FASE 5: COFRE DE SENHAS** (CONCLUÍDA - núcleo)

### 🟢 Controllers e Endpoints
- [x] PasswordVaultController
  - [x] POST /api/providers/:providerId/passwords (adicionar senha)
  - [x] GET /api/providers/:providerId/passwords (listar senhas)
  - [x] GET /api/passwords/:id (detalhes da senha)
  - [x] PUT /api/passwords/:id (atualizar senha)
  - [x] DELETE /api/passwords/:id (remover senha)

### 🟢 Segurança
- [x] Criptografia AES-256-GCM para armazenamento seguro
- [x] Descriptografia condicionada por papel (admin/manager/super_admin)
- [ ] Log de acessos às senhas (auditoria)
- [ ] Expiração e rotação de senhas
- [ ] RBAC refinado por provedor (regras finas)

### 🟢 Services e Repositories
- [x] PasswordVaultService
- [x] PasswordVaultRepository
- [x] passwordVaultValidators
- [x] encryptionUtils (helpers de criptografia)

### 🟢 Rotas e Validação
- [x] passwordVaultRoutes registradas em `/api/providers`
- [x] Protegidas por `authMiddleware` e validadas com Zod (`providerId`, `id`)

---

## 🟢 **FASE 6: DASHBOARD E RELATÓRIOS** (CONCLUÍDA - núcleo)

### 🟢 Controllers de Dashboard
- [x] DashboardController
  - [x] GET /api/dashboard/:providerId (dados completos)
  - [x] GET /api/dashboard/:providerId/equipment-stats (estatísticas de equipamentos)
  - [x] GET /api/dashboard/:providerId/ticket-stats (estatísticas de tickets)
  - [x] GET /api/dashboard/:providerId/password-stats (estatísticas do cofre)

### 🟢 Métricas Implementadas
- [x] Quantidade total de equipamentos por tipo
- [x] Tickets por status e prioridade
- [x] Estatísticas do cofre de senhas
- [x] Atividades recentes
- [x] Visão geral do provedor

### 🟢 Services e Repositories
- [x] DashboardService (integração com todos os repositórios)
- [x] Métodos de estatísticas em EquipmentRepository
- [x] Métodos de estatísticas em TicketRepository
- [x] Métodos de estatísticas em PasswordVaultRepository

### 🟢 Rotas e Middlewares
- [x] dashboardRoutes.ts (rotas protegidas por autenticação)
- [x] Integração no server.ts
- [x] Validação de parâmetros e controle de acesso

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

### ✅ Concluído (55%)
- Estrutura base do projeto
- Sistema de autenticação completo
- Configuração do banco de dados
- Models básicos no Prisma
- Gestão de provedores: Controller, Service, Repository, Validators, Rotas
- Gestão de equipamentos: endpoints de criar/listar e rotas protegidas
- Sistema de tickets: Controller, Service, Repository, Validators, Rotas
- Cofre de senhas: endpoints CRUD, Service, Repository, Validators, Rotas, criptografia AES-256-GCM
- Dashboard e relatórios: Controller, Service, Repository, Rotas (núcleo implementado)

### 🚧 Em Desenvolvimento (Gestão de Equipamentos e Provedores)
- Equipamentos: refinamentos, filtros e documentação
- Ajustes de permissões por papel (regras finas por provedor)
- Geração automática de workspace (Provedores)
- Estatísticas e métricas adicionais (Provedores)
- RBAC refinado do cofre e auditoria de acessos

### 🟡 Em Desenvolvimento (10%)
- Dashboard e relatórios (CONCLUÍDO - núcleo implementado)

### 🔴 Pendente (45%)
- Ordens de serviço
- Melhorias e otimizações
- Funcionalidades com IA

---

## 🎯 **PRÓXIMOS PASSOS RECOMENDADOS**

1. Validar e documentar endpoints de Equipments (CRUD + stats)
2. Melhorar paginação e filtros (status, type, search)
3. Configurar `ENCRYPTION_KEY` seguro em produção
4. Implementar auditoria de acessos do cofre
5. Definir RBAC refinado para leitura descriptografada
6. Preparar migrações e seeds (se necessário)
7. Documentar APIs no Swagger

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

*Roadmap atualizado em: Janeiro 2025*
*Status: 55% concluído - Autenticação finalizada; núcleo de Provedores concluído; Equipamentos iniciado; Tickets concluídos (núcleo); Cofre de Senhas concluído (núcleo); Dashboard e Relatórios concluído (núcleo)*
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

## 🚧 **FASE 5: COFRE DE SENHAS** (CONCLUÍDA - núcleo)

### 🟢 Controllers e Endpoints
- [x] PasswordVaultController
  - [x] POST /api/providers/:providerId/passwords (adicionar senha)
  - [x] GET /api/providers/:providerId/passwords (listar senhas)
  - [x] GET /api/passwords/:id (detalhes da senha)
  - [x] PUT /api/passwords/:id (atualizar senha)
  - [x] DELETE /api/passwords/:id (remover senha)

### 🟢 Segurança
- [x] Criptografia AES-256-GCM para armazenamento seguro
- [x] Descriptografia condicionada por papel (admin/manager/super_admin)
- [ ] Log de acessos às senhas
- [ ] Expiração/rotação de senhas
- [ ] RBAC refinado por provedor (regras finas)

### 🟢 Services e Repositories
- [x] PasswordVaultService
- [x] PasswordVaultRepository
- [x] passwordVaultValidators
- [x] Utilitários de criptografia (encryptionUtils)

### 🟢 Rotas e Validação
- [x] Rotas registradas em `/api/providers`
- [x] Protegidas por `authMiddleware` e validadas com Zod

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

### ✅ Concluído (45%)
- Estrutura base do projeto
- Sistema de autenticação completo (AuthController, TokenService)
- Configuração do banco de dados
- Models básicos no Prisma
- Gestão de provedores e equipamentos (Controllers e rotas)
- Sistema de tickets (Controllers e rotas)
- Cofre de senhas: endpoints CRUD, Service, Repository, Validators, Rotas, criptografia AES-256-GCM

### 🚧 Em Desenvolvimento
- Gestão de equipamentos: criar/detalhes/listar/atualizar (refinamentos)
- Gestão de provedores: criar/detalhes/listar/atualizar (refinamentos)
- Autorização por papéis de usuário (RBAC) e auditoria do cofre

### 🔴 Pendente (55%)
- Dashboard e relatórios
- Ordens de serviço
- Melhorias e otimizações
- IA

---

## 🎯 **PRÓXIMOS PASSOS RECOMENDADOS**

1. **Implementar Sistema de Ordens de Serviço (Fase 7)**
   - Criar model ServiceOrder no Prisma
   - Implementar Controller, Service e Repository
   - Definir workflow de status das ordens
   
2. **Melhorar Dashboard (opcional)**
   - Adicionar gráficos e visualizações
   - Implementar filtros por período
   - Adicionar métricas de performance
   
3. **Validar e documentar endpoints existentes**
   - Documentar APIs no Swagger
   - Melhorar paginação e filtros
   - Configurar `ENCRYPTION_KEY` seguro em produção
   
4. **Implementar melhorias de segurança**
   - Auditoria de acessos do cofre
   - RBAC refinado para leitura descriptografada
   - Rate limiting nos endpoints

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
*Status: 45% concluído - Autenticação finalizada; núcleo de Provedores concluído; Equipamentos iniciado; Tickets concluídos (núcleo); Cofre de Senhas concluído (núcleo)*