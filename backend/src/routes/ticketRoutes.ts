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
import multer from 'multer';

const router = Router();
const controller = new TicketController();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// Protegidas: exigem autenticação com cache para consultas
// Restringe providerId para dígitos, evitando colisão com rotas como /reports/tickets
router.get('/:providerId(\\d+)/tickets', authMiddleware, validateParams(providerIdParamSchema), validateQuery(listTicketsSchema), listCacheMiddleware(), (req, res) => controller.list(req as any, res));
router.get('/:providerId(\\d+)/tickets/kanban', authMiddleware, validateParams(providerIdParamSchema), cacheMiddleware({ ttl: 60, keyPrefix: 'kanban', varyBy: ['userId', 'providerId'] }), (req, res) => controller.kanban(req as any, res));
// Kanban global (sem providerId) com cache
router.get('/tickets/kanban', authMiddleware, cacheMiddleware({ ttl: 60, keyPrefix: 'kanban_all', varyBy: ['userId'] }), (req, res) => controller.kanbanAll(req as any, res));
// Lista global de tickets (sem providerId) com cache
router.get('/tickets', authMiddleware, validateQuery(listTicketsSchema), cacheMiddleware({ ttl: 30, keyPrefix: 'tickets_all', varyBy: ['userId', 'query.page', 'query.limit', 'query.search', 'query.status', 'query.priority', 'query.startDate', 'query.endDate'] }), (req, res) => controller.listAll(req as any, res));
router.post('/:providerId(\\d+)/tickets', authMiddleware, validateParams(providerIdParamSchema), validateSchema(createTicketSchema), (req, res) => controller.create(req as any, res));
router.get('/:providerId(\\d+)/tickets/stats', authMiddleware, validateParams(providerIdParamSchema), statsCacheMiddleware(), (req, res) => controller.getStats(req as any, res));

// CRUD por ID de ticket com cache para consultas
router.get('/tickets/:id', authMiddleware, validateParams(ticketIdParamSchema), ticketCacheMiddleware(), (req, res) => controller.getById(req as any, res));
/**
 * @swagger
 * /api/tickets/{id}/with-provider:
 *   get:
 *     summary: Detalha ticket incluindo dados do provedor
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
 *         description: Ticket e dados do provedor
 *       404:
 *         description: Ticket não encontrado
 */
router.get('/tickets/:id/with-provider', authMiddleware, validateParams(ticketIdParamSchema), ticketCacheMiddleware(), (req, res) => controller.getByIdWithProvider(req as any, res));
/**
 * @swagger
 * /api/tickets/{id}/attachments:
 *   get:
 *     summary: Lista anexos do ticket
 *     tags: [Attachments]
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
 *         description: Lista de anexos
 */
router.get('/tickets/:id/attachments', authMiddleware, validateParams(ticketIdParamSchema), (req, res) => controller.listAttachments(req as any, res));
/**
 * @swagger
 * /api/tickets/{id}/attachments:
 *   post:
 *     summary: Envia anexo para o ticket
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Anexo criado
 */
router.post('/tickets/:id/attachments', authMiddleware, validateParams(ticketIdParamSchema), upload.single('file'), (req, res) => controller.uploadAttachment(req as any, res));
/**
 * @swagger
 * /api/tickets/{id}/attachments/{attachmentId}:
 *   delete:
 *     summary: Remove anexo do ticket
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/tickets/:id/attachments/:attachmentId', authMiddleware, (req, res) => controller.deleteAttachment(req as any, res));
/**
 * @swagger
 * /api/tickets/{id}/tags:
 *   get:
 *     summary: Lista tags do ticket
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Associa tags ao ticket
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 */
router.get('/tickets/:id/tags', authMiddleware, validateParams(ticketIdParamSchema), (req, res) => controller.listTags(req as any, res));
router.post('/tickets/:id/tags', authMiddleware, validateParams(ticketIdParamSchema), (req, res) => controller.addTags(req as any, res));
/**
 * @swagger
 * /api/tickets/{id}/tags/{tagId}:
 *   delete:
 *     summary: Remove tag do ticket
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/tickets/:id/tags/:tagId', authMiddleware, (req, res) => controller.removeTag(req as any, res));
/**
 * @swagger
 * /api/tickets/{id}/annotations:
 *   get:
 *     summary: Lista anotações do ticket
 *     tags: [Annotations]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Cria anotação no ticket
 *     tags: [Annotations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               isInternal:
 *                 type: boolean
 */
router.get('/tickets/:id/annotations', authMiddleware, validateParams(ticketIdParamSchema), (req, res) => controller.listAnnotations(req as any, res));
router.post('/tickets/:id/annotations', authMiddleware, validateParams(ticketIdParamSchema), (req, res) => controller.addAnnotation(req as any, res));
router.get('/tickets/:id/history', authMiddleware, validateParams(ticketIdParamSchema), validateQuery(historyQuerySchema), cacheMiddleware({ ttl: 120, keyPrefix: 'history', varyBy: ['userId', 'providerId', 'params.id', 'query.page', 'query.limit'] }), (req, res) => controller.history(req as any, res));
router.put('/tickets/:id', authMiddleware, validateParams(ticketIdParamSchema), validateSchema(updateTicketSchema), (req, res) => controller.update(req as any, res));
router.put('/tickets/:id/status', authMiddleware, validateParams(ticketIdParamSchema), validateSchema(updateTicketStatusSchema), (req, res) => controller.updateStatus(req as any, res));
router.delete('/tickets/:id', authMiddleware, validateParams(ticketIdParamSchema), (req, res) => controller.delete(req as any, res));
// Novo: criar ticket automaticamente vinculado ao provedor do usuário
router.post('/tickets', authMiddleware, validateSchema(createTicketSchema), (req, res) => controller.createForCurrentProvider(req as any, res));

export default router;
