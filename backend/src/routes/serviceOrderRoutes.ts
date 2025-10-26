/**
 * @swagger
 * tags:
 *   name: Service Orders
 *   description: Ordens de serviço
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
 *     summary: Estatísticas de OS
 *     tags: [Service Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas
 */

import { Router } from 'express';
import { ServiceOrderController } from '../controllers/serviceOrderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createServiceOrderSchema,
  updateServiceOrderSchema,
  updateServiceOrderStatusSchema,
  listServiceOrdersSchema,
  serviceOrderStatsSchema,
  serviceOrderIdParamSchema,
  validateSchema,
  validateParams,
  validateQuery,
  historyQuerySchema
} from '../validators/serviceOrderValidator';
import { listCacheMiddleware, serviceOrderCacheMiddleware, statsCacheMiddleware, cacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();
const controller = new ServiceOrderController();

// Service order statistics with cache
router.get('/stats', authMiddleware, validateQuery(serviceOrderStatsSchema), statsCacheMiddleware(), (req, res) => controller.getStats(req as any, res));

// Kanban board for service orders
router.get('/kanban', authMiddleware, validateQuery(serviceOrderStatsSchema), cacheMiddleware({ ttl: 60, keyPrefix: 'kanban', varyBy: ['userId', 'providerId'] }), (req, res) => controller.kanban(req as any, res));

// List service orders with cache
router.get('/', authMiddleware, validateQuery(listServiceOrdersSchema), listCacheMiddleware(), (req, res) => controller.getAll(req as any, res));

// Get service order by ID with cache
router.get('/:id', authMiddleware, validateParams(serviceOrderIdParamSchema), serviceOrderCacheMiddleware(), (req, res) => controller.getById(req as any, res));

// Get service order history by ID with cache
router.get('/:id/history', authMiddleware, validateParams(serviceOrderIdParamSchema), validateQuery(historyQuerySchema), cacheMiddleware({ ttl: 120, keyPrefix: 'history', varyBy: ['userId', 'providerId', 'params.id', 'query.page', 'query.limit'] }), (req, res) => controller.history(req as any, res));

// Create service order
router.post('/', authMiddleware, validateSchema(createServiceOrderSchema), (req, res) => controller.create(req as any, res));

// Update service order
router.put('/:id', authMiddleware, validateParams(serviceOrderIdParamSchema), validateSchema(updateServiceOrderSchema), (req, res) => controller.update(req as any, res));

// Update service order status
router.patch('/:id/status', authMiddleware, validateParams(serviceOrderIdParamSchema), validateSchema(updateServiceOrderStatusSchema), (req, res) => controller.updateStatus(req as any, res));

// Delete service order
router.delete('/:id', authMiddleware, validateParams(serviceOrderIdParamSchema), (req, res) => controller.delete(req as any, res));

export default router;