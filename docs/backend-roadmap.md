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
- [x] Geração automática de workspace único
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
- [x] Histórico de alterações

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
- [x] Vinculação automática ao provedor
- [x] Sistema de comentários/atualizações
- [x] Notificações de mudança de status
- [x] Filtros avançados (status, prioridade, data)

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
- [x] Log de acessos às senhas (auditoria)
- [x] Expiração e rotação de senhas
- [x] RBAC refinado por provedor (regras finas)

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

## 🟢 **FASE 7: SISTEMA DE ORDENS DE SERVIÇO** (CONCLUÍDA - núcleo)

### 🟢 Model no Prisma
- [x] ServiceOrder (ordem de serviço)
  - [x] Relacionamento com Provider
  - [x] Relacionamento com Ticket (opcional)
  - [x] Status workflow (pending, in_progress, completed, cancelled)
  - [x] Prioridades (low, medium, high, critical)
  - [x] Campos de execução (título, descrição, observações)

### 🟢 Controllers e Endpoints
- [x] ServiceOrderController
  - [x] POST /api/providers/:providerId/service-orders (criar ordem)
  - [x] GET /api/providers/:providerId/service-orders (listar ordens)
  - [x] GET /api/service-orders/:id (detalhes da ordem)
  - [x] PUT /api/service-orders/:id (atualizar ordem)
  - [x] PUT /api/service-orders/:id/status (alterar status)
  - [x] DELETE /api/service-orders/:id (remover ordem)
  - [x] GET /api/providers/:providerId/service-orders/stats (estatísticas)

### 🟢 Sistema de Status
- [x] Pendente (pending)
- [x] Em andamento (in_progress)
- [x] Concluída (completed)
- [x] Cancelada (cancelled)

### 🟢 Sistema de Prioridades
- [x] Baixa (low)
- [x] Média (medium)
- [x] Alta (high)
- [x] Crítica (critical)

### 🟢 Services e Repositories
- [x] ServiceOrderService (lógica de negócio)
- [x] ServiceOrderRepository (acesso a dados)
- [x] serviceOrderValidators (validação Zod)

### 🟢 Rotas e Validação
- [x] serviceOrderRoutes registradas em `/api/providers` e `/api/service-orders`
- [x] Protegidas por `authMiddleware` e validadas com Zod
- [x] Controle de acesso por provedor

### 🟡 Funcionalidades Avançadas
- [x] Filtros por status e prioridade
- [x] Estatísticas e métricas
- [x] Vinculação opcional com tickets
- [x] Sistema de comentários/atualizações
- [x] Notificações de mudança de status
- [x] Visualização Kanban
- [x] Histórico de alterações

---

## 🚧 **FASE 8: MELHORIAS E OTIMIZAÇÕES** (EM PROGRESSO)

### 🟢 Performance
- [x] Cache Redis implementado e integrado via middlewares (listas, detalhes e estatísticas)
- [x] Redis via Docker Compose (`redis:7-alpine`), persistência AOF, volume e healthcheck
- [x] Autenticação Redis por senha (`REDIS_PASSWORD`) habilitada no ambiente local
- [x] Integração por env: `REDIS_ENABLED`, `REDIS_URL` (IPv4), `REDIS_PASSWORD`
- [x] Estratégia de conexão robusta (`lazyConnect`, `readyCheck`, reconexão desativada quando indisponível)
- [x] Paginação otimizada em todos os endpoints (implementada com `calculatePagination` e `createPaginationMeta`)
- [ ] Otimização de queries Prisma
- [ ] Índices no banco de dados

### 🟡 Segurança
- [x] Rate limiting
- [x] Validação de entrada mais rigorosa (expandida nos validators com Zod, sanitização automática)
- [x] Logs de auditoria
- [x] Sanitização de dados de entrada (implementada nos validators)

### 🟢 Documentação
- [x] Swagger/OpenAPI completo cobrindo Providers, Equipments, Tickets, Service Orders, Dashboard, PasswordVault e Comments
- [x] Documentação de APIs disponível em `/docs`
- [x] Endpoints atualizados com exemplos, schemas e responses
- [x] Guias de desenvolvimento

### 🟢 Infra & DevOps
- [x] Docker Compose com serviço Redis protegido por senha e volume persistente
- [x] `.env` raiz para Compose (`REDIS_PASSWORD`, `REDIS_PORT`)
- [x] `.env` do backend com `REDIS_ENABLED`, `REDIS_URL`, `REDIS_PASSWORD`
- [x] CORS configurado para `http://localhost:5173` (frontend dev)

---

## 🟢 **FASE 9: FUNCIONALIDADES COM IA** (CONCLUÍDA - núcleo)

### 🟢 Controllers e Endpoints
- [x] AIController com 14 métodos implementados
  - [x] POST /api/ai/analyze-ticket (análise de tickets com IA)
  - [x] GET /api/ai/predict-failures/:providerId (previsão de falhas)
  - [x] GET /api/ai/insights/:providerId (insights para dashboard)
  - [x] POST /api/ai/recommendations (geração de recomendações)
  - [x] GET /api/ai/alerts/:providerId (alertas inteligentes)

### 🟢 Machine Learning
- [x] POST /api/ai/ml/train/:providerId (treinamento de modelo ML)
- [x] POST /api/ai/ml/classify-ticket (classificação automática de tickets)
- [x] GET /api/ai/ml/historical-patterns/:providerId (análise de padrões históricos)

### 🟢 Análise de Equipamentos
- [x] GET /api/ai/equipment/health/:providerId (análise de saúde dos equipamentos)
- [x] GET /api/ai/equipment/predict-failure/:equipmentId (previsão de falha específica)
- [x] GET /api/ai/equipment/maintenance-schedule/:providerId (cronograma de manutenção preditiva)
- [x] GET /api/ai/equipment/detect-anomalies/:providerId (detecção de anomalias)

### 🟢 Chat Inteligente
- [x] POST /api/ai/chat/start (iniciar sessão de chat)
- [x] POST /api/ai/chat/message (processar mensagens)
- [x] POST /api/ai/chat/find-solution (busca automática de soluções)
- [x] GET /api/ai/chat/suggestions/:providerId (sugestões proativas)
- [x] POST /api/ai/chat/end/:sessionId (encerrar sessão)

### 🟢 Services e Repositories
- [x] AIService (lógica de análise e predição)
- [x] IntelligentChatService (processamento de chat inteligente)
- [x] Integração com todos os repositórios existentes

### 🟢 Funcionalidades Implementadas
- [x] Análise automática de prioridade de tickets
- [x] Previsão de falhas baseada em padrões históricos
- [x] Detecção de anomalias em equipamentos
- [x] Geração de insights para dashboard
- [x] Sistema de alertas inteligentes
- [x] Chat contextual com base de conhecimento
- [x] Sugestões proativas baseadas em dados
- [x] Cronograma de manutenção preditiva

### 🟢 Rotas e Documentação
- [x] aiRoutes.ts com documentação Swagger completa
- [x] Protegidas por authMiddleware
- [x] Validação de parâmetros e controle de acesso

---

## 📊 **RESUMO DO PROGRESSO**

### ✅ Concluído (90%)
- Estrutura base do projeto
- Sistema de autenticação completo
- Configuração do banco de dados
- Models básicos no Prisma (incluindo ServiceOrder)
- Gestão de provedores: Controller, Service, Repository, Validators, Rotas (completo)
- Gestão de equipamentos: Controller, Service, Repository, Validators, Rotas (completo)
- Sistema de tickets: Controller, Service, Repository, Validators, Rotas (completo)
- Cofre de senhas: Controller, Service, Repository, Validators, Rotas, criptografia AES-256-GCM (completo)
- Dashboard e relatórios: Controller, Service, Repository, Rotas (núcleo implementado)
- Sistema de ordens de serviço: Controller, Service, Repository, Validators, Rotas (núcleo implementado)
- **Funcionalidades com IA: AIController com 14 métodos, análise inteligente de tickets, previsão de falhas, chat inteligente, machine learning (núcleo implementado)**
- **Paginação otimizada implementada em todos os endpoints de listagem**
- **Documentação Swagger/OpenAPI completa para todas as APIs (disponível em /docs)**
- **Validação de entrada rigorosa com Zod e sanitização automática**

### 🟡 Funcionalidades Avançadas Pendentes (5%)
- Notificações de mudança de status
- Visualização Kanban para ordens de serviço
- Histórico de alterações
- RBAC refinado do cofre

### 🔴 Pendente (5%)
- Melhorias e otimizações restantes (índices no banco)
- Funcionalidades avançadas de IA (integração com LLMs externos, modelos personalizados)

---

## 🎯 **PRÓXIMOS PASSOS RECOMENDADOS**

1. **Funcionalidades Avançadas**
   - Notificações de mudança de status
   - Visualização Kanban para ordens de serviço
   - Histórico de alterações nos módulos principais
   - Comentários com menções, anexos e edição (refinar)

2. **Segurança e Auditoria**
   - Auditoria de acessos do cofre e eventos críticos
   - RBAC refinado por provedor (regras finas)
   - Expiração e rotação de senhas
   - Logs de auditoria completos

3. **Performance**
   - Índices no banco de dados para otimizar consultas
   - Otimização de queries Prisma
   - Revisão de estratégias de invalidação de cache

4. **IA**
   - Integração com LLMs externos (OpenAI, Claude, etc.)
   - Modelos de ML personalizados por provedor
   - Análise preditiva com dados em tempo real

---

## 🚧 **FASE 10: ÁREA DO CLIENTE (PORTAL DO PROVEDOR)** (EM PROGRESSO)

### 🟡 Objetivo
- Oferecer ao provedor uma interface de autoatendimento para abrir e acompanhar ordens de serviço e tickets, comentar, anexar evidências e qualificar atendimentos, com todas as informações úteis em um painel dedicado.

### 🟡 Controllers e Endpoints
- [x] ClientAuthController
  - [x] POST /api/client/auth/register (registro do cliente; rate limit: authRateLimit; validação Zod)
  - [x] POST /api/client/auth/login (login do cliente; rate limit: authRateLimit; validação Zod)
  - [x] POST /api/client/auth/forgot-password (iniciar recuperação)
  - [x] POST /api/client/auth/reset-password (concluir recuperação)
- [x] ClientProfileController
  - [x] GET /api/client/auth/profile (dados do cliente; auth: clientAuthMiddleware)
  - [x] PUT /api/client/profile (atualizar preferências; validação Zod)
- [x] ClientServiceOrderController
  - [x] POST /api/client/service-orders (abrir ordem de serviço; body: title, description, scheduledDate opcional; auth: clientAuthMiddleware; validação Zod)
  - [x] GET /api/client/service-orders (listar; query: page, limit, status; auth: clientAuthMiddleware; paginação aplicada)
  - [x] GET /api/client/service-orders/:id (detalhes; auth: clientAuthMiddleware)
  - [x] PUT /api/client/service-orders/:id (atualizar campos do cliente; validação Zod; auth: clientAuthMiddleware)
  - [x] POST /api/client/service-orders/:id/comments (comentar; body: content; auth: clientAuthMiddleware; validação Zod)
  - [x] POST /api/client/service-orders/:id/qualification (qualificar atendimento; body: rating 1-5, feedback opcional; auth: clientAuthMiddleware; validação Zod)
  - [ ] POST /api/client/service-orders/:id/attachments (upload de anexos; multipart/form-data; validação de tipo/tamanho; auth: clientAuthMiddleware)
- [x] ClientTicketController
  - [x] POST /api/client/tickets (abrir ticket)
  - [x] GET /api/client/tickets (listar)
  - [x] GET /api/client/tickets/:id (detalhes)
  - [x] POST /api/client/tickets/:id/comments (comentar)
  - [ ] POST /api/client/tickets/:id/attachments (upload de anexos)
- [ ] ClientNotificationController
  - [ ] GET /api/client/notifications (listar notificações)
  - [ ] PUT /api/client/notifications/:id/read (marcar como lida)

### 🟢 Validação (sem testes automatizados)
- [x] Smoke test manual: login, abrir OS, listar, detalhar, atualizar, comentar e qualificar

### 🟡 Segurança e Acesso
- [x] Autenticação JWT dedicada (`clientAuth`) com escopo de cliente
- [ ] RBAC por provedor e perfil de cliente (`customer_admin`, `customer_user`)
- [x] Rate limiting específico para rotas de cliente
- [ ] Auditoria completa das ações (abrir OS, comentar, anexar, qualificar)

### 🟡 Services e Repositories
- [ ] ClientAuthService, ClientProfileService
- [ ] ClientServiceOrderService, ClientTicketService
- [ ] ClientNotificationService
- [ ] Repositórios com filtros e escopo por `providerId` e `customerId`

### 🟢 Rotas e Middlewares
- [x] `clientRoutes` registradas em `/api/client`
- [x] Protegidas por `clientAuthMiddleware` e validadas com Zod
- [x] CORS e rate limit ajustados para o portal

### 🟡 Funcionalidades Específicas
- [x] Comentários
- [x] Qualificação de atendimentos com nota e feedback
- [ ] Linha do tempo e histórico de atividades de OS/tickets
- [ ] SLA, prazos e status visíveis para o cliente
- [ ] Preferências do cliente (canal de contato, horários, notificações)
- [ ] Consulta opcional aos equipamentos do cliente
- [ ] Visualização em Kanban para o cliente
- [ ] Notificações por e-mail e push (quando aplicável)

### 🟡 Documentação
- [ ] Swagger/OpenAPI com seção "Client Portal"
- [ ] Exemplos de requests/responses e regras de RBAC

### 🟡 Frontend (Portal Web)
- [ ] Páginas: Login, Esqueci senha, Reset de senha, Dashboard do cliente
- [ ] Dashboard: cards de status (OS, tickets), prazos e SLAs, próximas manutenções
- [ ] Minhas Ordens de Serviço: lista, detalhe, abrir, comentários, anexos
- [ ] Meus Tickets: lista, detalhe, abrir, comentários, anexos
- [ ] Notificações: inbox e toasts, preferências por canal
- [ ] Perfil e Preferências: dados, canais, horários, 2FA
- [ ] Equipamentos: lista e detalhes vinculados ao cliente (opcional)
- [ ] Agenda: agendamentos e janelas de manutenção (opcional)
- [ ] Central de Ajuda: base de conhecimento e contatos

### 🟡 Informações Úteis ao Cliente
- [ ] SLA por serviço, prazos e etapas da OS/ticket
- [ ] Status da rede, incidentes e manutenções programadas
- [ ] Canal de suporte, horários e equipe responsável
- [ ] Histórico e tempo médio de atendimento (MTTA/MTTR)
- [ ] Documentos: contrato, políticas e termos (opcional)
- [ ] Links rápidos: abrir OS, falar com suporte, ver equipamento

### 🟡 Experiência e Acessibilidade
- [ ] Responsivo, dark mode, acessibilidade (WCAG) e i18n
- [ ] Navegação por teclado e `aria-labels`
- [ ] Desempenho: lazy loading, cache e paginação
- [ ] Observabilidade: métricas de uso e feedback

### 🟡 Segurança (Cliente)
- [ ] 2FA opcional, requisitos mínimos de senha
- [ ] Sessão com refresh tokens e expiração
- [ ] Proteção CSRF para formulários sensíveis
- [ ] Logs e auditoria das ações do cliente

### 🔜 Próximas Funções (Fase 10)
- [ ] Recuperação de senha: `POST /api/client/auth/forgot-password`, `POST /api/client/auth/reset-password`
- [x] Atualização de perfil: `PUT /api/client/profile` com validação Zod
- [ ] Anexos em OS: `POST /api/client/service-orders/:id/attachments` com validação de tipo/tamanho; definir armazenamento (local/S3) e auditoria
- [ ] Tickets do cliente: `POST /api/client/tickets`, `GET /api/client/tickets`, `GET /api/client/tickets/:id`, `POST /api/client/tickets/:id/comments`, `POST /api/client/tickets/:id/attachments`
- [ ] Notificações: `GET /api/client/notifications`, `PUT /api/client/notifications/:id/read`
- [ ] RBAC do cliente: papéis `customer_admin` e `customer_user` com escopo por `providerId`
- [ ] Auditoria de ações do cliente: abrir OS/ticket, comentar, anexar, qualificar
- [ ] Linha do tempo de OS/tickets: histórico de eventos visível ao cliente
- [ ] OpenAPI: seção "Client Portal" com exemplos e regras de acesso
- [ ] Frontend portal: Login, Esqueci senha, Reset, Dashboard, Minhas OS, Meus Tickets, Notificações, Perfil

## 🛠️ **TECNOLOGIAS UTILIZADAS**

- **Runtime**: Node.js
- **Linguagem**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco**: PostgreSQL
- **Cache**: Redis (Node-Redis)
- **Autenticação**: JWT + bcrypt
- **Validação**: Zod
- **Documentação**: Swagger/OpenAPI (implementado e disponível em /docs)
- **Gerenciador**: pnpm
- **Orquestração local**: Docker Compose (PostgreSQL, Redis)
- **Processo**: PM2

---

*Roadmap atualizado em: Janeiro 2025*
*Status: 90% concluído - Todas as funcionalidades principais implementadas: Autenticação, Provedores, Equipamentos, Tickets, Cofre de Senhas, Dashboard, Ordens de Serviço e **Funcionalidades com IA** (análise inteligente, previsão de falhas, chat inteligente, machine learning). Implementadas também: Paginação otimizada, Documentação Swagger/OpenAPI completa e Validação rigorosa de entrada. Foco agora em funcionalidades avançadas e otimizações finais.*