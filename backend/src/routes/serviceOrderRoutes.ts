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
  validateQuery
} from '../validators/serviceOrderValidator';

const router = Router();
const controller = new ServiceOrderController();

// Service order statistics
router.get('/stats', authMiddleware, validateQuery(serviceOrderStatsSchema), (req, res) => controller.getStats(req as any, res));

// List service orders
router.get('/', authMiddleware, validateQuery(listServiceOrdersSchema), (req, res) => controller.getAll(req as any, res));

// Get service order by ID
router.get('/:id', authMiddleware, validateParams(serviceOrderIdParamSchema), (req, res) => controller.getById(req as any, res));

// Create service order
router.post('/', authMiddleware, validateSchema(createServiceOrderSchema), (req, res) => controller.create(req as any, res));

// Update service order
router.put('/:id', authMiddleware, validateParams(serviceOrderIdParamSchema), validateSchema(updateServiceOrderSchema), (req, res) => controller.update(req as any, res));

// Update service order status
router.patch('/:id/status', authMiddleware, validateParams(serviceOrderIdParamSchema), validateSchema(updateServiceOrderStatusSchema), (req, res) => controller.updateStatus(req as any, res));

// Delete service order
router.delete('/:id', authMiddleware, validateParams(serviceOrderIdParamSchema), (req, res) => controller.delete(req as any, res));

export default router;