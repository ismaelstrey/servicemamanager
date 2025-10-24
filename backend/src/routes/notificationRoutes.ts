import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { cacheMiddleware } from '../middleware/cacheMiddleware';
import { validateParams, validateQuery } from '../validators/providerValidator';
import { providerIdParamSchema, listNotificationsSchema, notificationIdParamSchema } from '../validators/notificationValidator';

const router = Router();
const controller = new NotificationController();

// Listar notificações por provider com cache
router.get(
  '/:providerId/notifications',
  authMiddleware,
  validateParams(providerIdParamSchema),
  validateQuery(listNotificationsSchema),
  cacheMiddleware({
    ttl: 120,
    keyPrefix: 'notifications',
    varyBy: ['userId', 'providerId', 'params.providerId', 'query.page', 'query.limit', 'query.unread']
  }),
  (req, res) => controller.list(req as any, res)
);

// Marcar uma notificação como lida
router.post(
  '/notifications/:id/read',
  authMiddleware,
  validateParams(notificationIdParamSchema),
  (req, res) => controller.markRead(req as any, res)
);

// Marcar todas as notificações de um provider como lidas
router.post(
  '/:providerId/notifications/mark-all-read',
  authMiddleware,
  validateParams(providerIdParamSchema),
  (req, res) => controller.markAllRead(req as any, res)
);

export default router;