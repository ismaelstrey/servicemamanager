"use strict";
/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Gestão de tickets
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
 *     summary: Cria ticket do provedor
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
const express_1 = require("express");
const ticketController_1 = require("../controllers/ticketController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const ticketValidator_1 = require("../validators/ticketValidator");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
const router = (0, express_1.Router)();
const controller = new ticketController_1.TicketController();
// Protegidas: exigem autenticação com cache para consultas
// Restringe providerId para dígitos, evitando colisão com rotas como /reports/tickets
router.get('/:providerId(\\d+)/tickets', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.providerIdParamSchema), (0, ticketValidator_1.validateQuery)(ticketValidator_1.listTicketsSchema), (0, cacheMiddleware_1.listCacheMiddleware)(), (req, res) => controller.list(req, res));
router.get('/:providerId(\\d+)/tickets/kanban', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.providerIdParamSchema), (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 60, keyPrefix: 'kanban', varyBy: ['userId', 'providerId'] }), (req, res) => controller.kanban(req, res));
// Kanban global (sem providerId) com cache
router.get('/tickets/kanban', authMiddleware_1.authMiddleware, (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 60, keyPrefix: 'kanban_all', varyBy: ['userId'] }), (req, res) => controller.kanbanAll(req, res));
// Lista global de tickets (sem providerId) com cache
router.get('/tickets', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateQuery)(ticketValidator_1.listTicketsSchema), (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 30, keyPrefix: 'tickets_all', varyBy: ['userId', 'query.page', 'query.limit', 'query.search', 'query.status', 'query.priority', 'query.startDate', 'query.endDate'] }), (req, res) => controller.listAll(req, res));
router.post('/:providerId(\\d+)/tickets', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.providerIdParamSchema), (0, ticketValidator_1.validateSchema)(ticketValidator_1.createTicketSchema), (req, res) => controller.create(req, res));
router.get('/:providerId(\\d+)/tickets/stats', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.providerIdParamSchema), (0, cacheMiddleware_1.statsCacheMiddleware)(), (req, res) => controller.getStats(req, res));
// CRUD por ID de ticket com cache para consultas
router.get('/tickets/:id', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, cacheMiddleware_1.ticketCacheMiddleware)(), (req, res) => controller.getById(req, res));
router.get('/tickets/:id/history', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, ticketValidator_1.validateQuery)(ticketValidator_1.historyQuerySchema), (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 120, keyPrefix: 'history', varyBy: ['userId', 'providerId', 'params.id', 'query.page', 'query.limit'] }), (req, res) => controller.history(req, res));
router.put('/tickets/:id', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, ticketValidator_1.validateSchema)(ticketValidator_1.updateTicketSchema), (req, res) => controller.update(req, res));
router.put('/tickets/:id/status', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, ticketValidator_1.validateSchema)(ticketValidator_1.updateTicketStatusSchema), (req, res) => controller.updateStatus(req, res));
router.delete('/tickets/:id', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (req, res) => controller.delete(req, res));
// Novo: criar ticket automaticamente vinculado ao provedor do usuário
router.post('/tickets', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateSchema)(ticketValidator_1.createTicketSchema), (req, res) => controller.createForCurrentProvider(req, res));
exports.default = router;
