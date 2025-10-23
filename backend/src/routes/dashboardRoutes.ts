import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { dashboardCacheMiddleware, statsCacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();
const dashboardController = new DashboardController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas do dashboard com cache
router.get('/:providerId', dashboardCacheMiddleware(), dashboardController.getDashboard.bind(dashboardController));
router.get('/:providerId/equipment-stats', statsCacheMiddleware(), dashboardController.getEquipmentStats.bind(dashboardController));
router.get('/:providerId/ticket-stats', statsCacheMiddleware(), dashboardController.getTicketStats.bind(dashboardController));
router.get('/:providerId/password-stats', statsCacheMiddleware(), dashboardController.getPasswordStats.bind(dashboardController));

export default router;