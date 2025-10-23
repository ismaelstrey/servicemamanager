import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const dashboardController = new DashboardController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas do dashboard
router.get('/:providerId', dashboardController.getDashboard.bind(dashboardController));
router.get('/:providerId/equipment-stats', dashboardController.getEquipmentStats.bind(dashboardController));
router.get('/:providerId/ticket-stats', dashboardController.getTicketStats.bind(dashboardController));
router.get('/:providerId/password-stats', dashboardController.getPasswordStats.bind(dashboardController));

export default router;