/**
 * @swagger
 * tags:
 *   name: Equipments
 *   description: Gestão de equipamentos
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

import { Router } from 'express';
import { EquipmentController } from '../controllers/equipmentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { 
  createEquipmentSchema,
  listEquipmentsSchema,
  providerIdParamSchema,
  updateEquipmentSchema,
  equipmentIdParamSchema,
  validateSchema,
  validateParams,
  validateQuery,
  historyQuerySchema
} from '../validators/equipmentValidator';
import { listCacheMiddleware, equipmentCacheMiddleware, statsCacheMiddleware, cacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();
const controller = new EquipmentController();

// Protegidas: exigem autenticação com cache para consultas
router.get('/:providerId/equipments', authMiddleware, validateParams(providerIdParamSchema), validateQuery(listEquipmentsSchema), listCacheMiddleware(), (req, res) => controller.list(req as any, res));
router.post('/:providerId/equipments', authMiddleware, validateParams(providerIdParamSchema), validateSchema(createEquipmentSchema), (req, res) => controller.create(req as any, res));
router.get('/:providerId/equipments/stats', authMiddleware, validateParams(providerIdParamSchema), statsCacheMiddleware(), (req, res) => controller.getStats(req as any, res));

// CRUD por ID de equipamento com cache para consultas
router.get('/equipments/:id', authMiddleware, validateParams(equipmentIdParamSchema), equipmentCacheMiddleware(), (req, res) => controller.getById(req as any, res));
router.get('/equipments/:id/history', authMiddleware, validateParams(equipmentIdParamSchema), validateQuery(historyQuerySchema), cacheMiddleware({ ttl: 120, keyPrefix: 'history', varyBy: ['userId', 'providerId', 'params.id', 'query.page', 'query.limit'] }), (req, res) => controller.history(req as any, res));
router.put('/equipments/:id', authMiddleware, validateParams(equipmentIdParamSchema), validateSchema(updateEquipmentSchema), (req, res) => controller.update(req as any, res));
router.delete('/equipments/:id', authMiddleware, validateParams(equipmentIdParamSchema), (req, res) => controller.delete(req as any, res));

export default router;