/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       401:
 *         description: Credenciais inválidas
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado
 */

/**
 * @swagger
 * /api/providers/check-workspace/{workspace}:
 *   get:
 *     summary: Verifica disponibilidade de workspace
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: workspace
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Situação do workspace
 */

/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: Lista provedores
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada
 *   post:
 *     summary: Cria provedor
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Provedor criado
 */

/**
 * @swagger
 * /api/providers/{id}:
 *   get:
 *     summary: Detalha provedor
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes retornados
 */

/**
 * @swagger
 * /api/providers/workspace/{workspace}:
 *   get:
 *     summary: Obtém provedor pelo workspace
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspace
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Provedor encontrado
 */

/**
 * @swagger
 * /api/providers/{providerId}/equipments:
 *   get:
 *     summary: Lista equipamentos do provedor
 *     tags: [Equipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista retornada
 *   post:
 *     summary: Cria equipamento
 *     tags: [Equipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Equipamento criado
 */

/**
 * @swagger
 * /api/providers/{providerId}/equipments/stats:
 *   get:
 *     summary: Estatísticas de equipamentos
 *     tags: [Equipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatísticas retornadas
 */

/**
 * @swagger
 * /api/providers/equipments/{id}:
 *   get:
 *     summary: Detalha equipamento
 *     tags: [Equipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes retornados
 *   put:
 *     summary: Atualiza equipamento
 *     tags: [Equipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Equipamento atualizado
 *   delete:
 *     summary: Remove equipamento
 *     tags: [Equipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Removido
 */

/**
 * @swagger
 * /api/providers/equipments/{id}/history:
 *   get:
 *     summary: Histórico do equipamento
 *     tags: [Equipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico retornado
 */

/**
 * @swagger
 * /api/providers/{providerId}/tickets:
 *   get:
 *     summary: Lista tickets do provedor
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista retornada
 *   post:
 *     summary: Cria ticket para provedor
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Ticket criado
 */

/**
 * @swagger
 * /api/tickets/kanban:
 *   get:
 *     summary: Kanban de tickets (global)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: providerId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filtra o Kanban por um provider específico
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Limite de itens por coluna
 *     responses:
 *       200:
 *         description: Board de Kanban retornado
 */

/**
 * @swagger
 * /api/providers/{providerId}/tickets/kanban:
 *   get:
 *     summary: Kanban de tickets por provider
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Limite de itens por coluna
 *     responses:
 *       200:
 *         description: Board de Kanban retornado
 */

/**
 * @swagger
 * /api/providers/{providerId}/tickets/stats:
 *   get:
 *     summary: Estatísticas de tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatísticas retornadas
 */

/**
 * @swagger
 * /api/providers/tickets/{id}:
 *   get:
 *     summary: Detalha ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes retornados
 *   put:
 *     summary: Atualiza ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ticket atualizado
 *   delete:
 *     summary: Remove ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Removido
 */

/**
 * @swagger
 * /api/providers/tickets/{id}/history:
 *   get:
 *     summary: Histórico do ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico retornado
 */

/**
 * @swagger
 * /api/providers/tickets:
 *   post:
 *     summary: Cria ticket para provedor atual
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Ticket criado
 */

/**
 * @swagger
 * /api/service-orders:
 *   get:
 *     summary: Lista ordens de serviço
 *     tags: [Service Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada
 *   post:
 *     summary: Cria ordem de serviço
 *     tags: [Service Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: OS criada
 */

/**
 * @swagger
 * /api/service-orders/stats:
 *   get:
 *     summary: Estatísticas de ordens de serviço
 *     tags: [Service Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas
 */

/**
 * @swagger
 * /api/service-orders/kanban:
 *   get:
 *     summary: Board Kanban de ordens de serviço
 *     tags: [Service Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Board retornado
 */

/**
 * @swagger
 * /api/service-orders/{id}:
 *   get:
 *     summary: Detalha ordem de serviço
 *     tags: [Service Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes retornados
 *   put:
 *     summary: Atualiza ordem de serviço
 *     tags: [Service Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OS atualizada
 *   delete:
 *     summary: Remove ordem de serviço
 *     tags: [Service Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Removido
 */

/**
 * @swagger
 * /api/service-orders/{id}/status:
 *   patch:
 *     summary: Atualiza status da ordem de serviço
 *     tags: [Service Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Status atualizado
 */

/**
 * @swagger
 * /api/service-orders/{id}/history:
 *   get:
 *     summary: Histórico da ordem de serviço
 *     tags: [Service Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico retornado
 */

/**
 * @swagger
 * /api/providers/{providerId}/passwords:
 *   get:
 *     summary: Lista senhas do provedor
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista retornada
 *   post:
 *     summary: Cria senha
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Senha criada
 */

/**
 * @swagger
 * /api/providers/passwords/{id}:
 *   get:
 *     summary: Detalha senha
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes retornados
 *   put:
 *     summary: Atualiza senha
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Senha atualizada
 *   delete:
 *     summary: Remove senha
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Removido
 */

/**
 * @swagger
 * /api/providers/passwords/{id}/rotate:
 *   post:
 *     summary: Rotaciona senha
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Senha rotacionada
 */

/**
 * @swagger
 * /api/dashboard/{providerId}:
 *   get:
 *     summary: Dados do dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados retornados
 */

/**
 * @swagger
 * /api/dashboard/{providerId}/equipment-stats:
 *   get:
 *     summary: Estatísticas de equipamentos para dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatísticas retornadas
 */

/**
 * @swagger
 * /api/dashboard/{providerId}/ticket-stats:
 *   get:
 *     summary: Estatísticas de tickets para dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatísticas retornadas
 */

/**
 * @swagger
 * /api/dashboard/{providerId}/password-stats:
 *   get:
 *     summary: Estatísticas de senhas para dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatísticas retornadas
 */

/**
 * @swagger
 * /api/providers/{providerId}/notifications:
 *   get:
 *     summary: Lista notificações do provedor
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista retornada
 */

/**
 * @swagger
 * /api/providers/{providerId}/notifications/mark-all-read:
 *   post:
 *     summary: Marca todas notificações como lidas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notificações marcadas
 */

/**
 * @swagger
 * /api/providers/notifications/{id}/read:
 *   post:
 *     summary: Marca notificação como lida
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notificação marcada
 */

/**
 * @swagger
 * /api/client/auth/register:
 *   post:
 *     summary: Registro de cliente
 *     tags: [Client Portal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Cliente registrado
 */

/**
 * @swagger
 * /api/client/auth/login:
 *   post:
 *     summary: Login do cliente
 *     tags: [Client Portal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Login realizado
 */

/**
 * @swagger
 * /api/client/auth/forgot-password:
 *   post:
 *     summary: Solicita recuperação de senha
 *     tags: [Client Portal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Instruções enviadas
 */

/**
 * @swagger
 * /api/client/auth/reset-password:
 *   post:
 *     summary: Redefine senha do cliente
 *     tags: [Client Portal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Senha redefinida
 */

/**
 * @swagger
 * /api/client/auth/profile:
 *   get:
 *     summary: Perfil do cliente autenticado
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado
 */

/**
 * @swagger
 * /api/client/profile:
 *   put:
 *     summary: Atualiza perfil do cliente
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Perfil atualizado
 */

/**
 * @swagger
 * /api/client/service-orders:
 *   get:
 *     summary: Lista OS do cliente
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada
 *   post:
 *     summary: Cria OS do cliente
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: OS criada
 */

/**
 * @swagger
 * /api/client/service-orders/{id}:
 *   get:
 *     summary: Detalha OS do cliente
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes retornados
 *   put:
 *     summary: Atualiza OS do cliente
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OS atualizada
 */

/**
 * @swagger
 * /api/client/service-orders/{id}/comments:
 *   post:
 *     summary: Adiciona comentário do cliente à OS
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Comentário adicionado
 */

/**
 * @swagger
 * /api/client/service-orders/{id}/qualification:
 *   post:
 *     summary: Qualifica OS do cliente
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Qualificação registrada
 */

/**
 * @swagger
 * /api/client/tickets:
 *   get:
 *     summary: Lista tickets do cliente
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada
 *   post:
 *     summary: Cria ticket do cliente
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Ticket criado
 */

/**
 * @swagger
 * /api/client/tickets/{id}:
 *   get:
 *     summary: Detalha ticket do cliente
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes retornados
 */

/**
 * @swagger
 * /api/client/tickets/{id}/comments:
 *   post:
 *     summary: Adiciona comentário do cliente ao ticket
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Comentário adicionado
 */

export {};