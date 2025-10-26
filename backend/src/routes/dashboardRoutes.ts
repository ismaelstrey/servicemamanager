/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dados agregados do dashboard
 */

/**
 * @swagger
 * /api/dashboard/{providerId}:
 *   get:
 *     summary: Dados do dashboard
 *     tags: [Dashboard]
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
 *         description: Dados retornados
 */

/**
 * @swagger
 * /api/dashboard/{providerId}/equipment-stats:
 *   get:
 *     summary: Estatísticas de equipamentos
 *     tags: [Dashboard]
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
 *         description: Estatísticas retornadas
 */

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