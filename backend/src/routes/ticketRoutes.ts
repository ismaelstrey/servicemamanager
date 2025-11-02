/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Gestão de tickets
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

import { Router } from 'express';
import { TicketController } from '../controllers/ticketController';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createTicketSchema,
  listTicketsSchema,
  providerIdParamSchema,
  updateTicketSchema,
  ticketIdParamSchema,
  updateTicketStatusSchema,
  validateSchema,
  validateParams,
  validateQuery,
  historyQuerySchema
} from '../validators/ticketValidator';
import { listCacheMiddleware, ticketCacheMiddleware, statsCacheMiddleware, cacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();
const controller = new TicketController();

// Protegidas: exigem autenticação com cache para consultas
router.get('/:providerId/tickets', authMiddleware, validateParams(providerIdParamSchema), validateQuery(listTicketsSchema), listCacheMiddleware(), (req, res) => controller.list(req as any, res));
router.get('/:providerId/tickets/kanban', authMiddleware, validateParams(providerIdParamSchema), cacheMiddleware({ ttl: 60, keyPrefix: 'kanban', varyBy: ['userId', 'providerId'] }), (req, res) => controller.kanban(req as any, res));
// Kanban global (sem providerId) com cache
router.get('/tickets/kanban', authMiddleware, cacheMiddleware({ ttl: 60, keyPrefix: 'kanban_all', varyBy: ['userId'] }), (req, res) => controller.kanbanAll(req as any, res));
router.post('/:providerId/tickets', authMiddleware, validateParams(providerIdParamSchema), validateSchema(createTicketSchema), (req, res) => controller.create(req as any, res));
router.get('/:providerId/tickets/stats', authMiddleware, validateParams(providerIdParamSchema), statsCacheMiddleware(), (req, res) => controller.getStats(req as any, res));

// CRUD por ID de ticket com cache para consultas
router.get('/tickets/:id', authMiddleware, validateParams(ticketIdParamSchema), ticketCacheMiddleware(), (req, res) => controller.getById(req as any, res));
router.get('/tickets/:id/history', authMiddleware, validateParams(ticketIdParamSchema), validateQuery(historyQuerySchema), cacheMiddleware({ ttl: 120, keyPrefix: 'history', varyBy: ['userId', 'providerId', 'params.id', 'query.page', 'query.limit'] }), (req, res) => controller.history(req as any, res));
router.put('/tickets/:id', authMiddleware, validateParams(ticketIdParamSchema), validateSchema(updateTicketSchema), (req, res) => controller.update(req as any, res));
router.put('/tickets/:id/status', authMiddleware, validateParams(ticketIdParamSchema), validateSchema(updateTicketStatusSchema), (req, res) => controller.updateStatus(req as any, res));
router.delete('/tickets/:id', authMiddleware, validateParams(ticketIdParamSchema), (req, res) => controller.delete(req as any, res));
// Novo: criar ticket automaticamente vinculado ao provedor do usuário
router.post('/tickets', authMiddleware, validateSchema(createTicketSchema), (req, res) => controller.createForCurrentProvider(req as any, res));

export default router;