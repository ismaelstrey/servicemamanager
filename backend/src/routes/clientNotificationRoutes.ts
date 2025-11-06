import { Router } from 'express';
import { ClientNotificationController } from '../controllers/clientNotificationController';
import { clientAuthMiddleware } from '../middlewares/clientAuthMiddleware';
import { validateQuery, validateParams } from '../validators/providerValidator';
import { listNotificationsSchema, notificationIdParamSchema } from '../validators/notificationValidator';

const router = Router();
const controller = new ClientNotificationController();

// Listar notificações do cliente autenticado
router.get('/', clientAuthMiddleware, validateQuery(listNotificationsSchema), (req, res) => controller.list(req as any, res));

// Marcar notificação do cliente como lida
router.put('/:id/read', clientAuthMiddleware, validateParams(notificationIdParamSchema), (req, res) => controller.markRead(req as any, res));

export default router;