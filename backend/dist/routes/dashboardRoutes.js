"use strict";
/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dados agregados do dashboard
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
const router = (0, express_1.Router)();
const dashboardController = new dashboardController_1.DashboardController();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Rotas do dashboard com cache
router.get('/:providerId', (0, cacheMiddleware_1.dashboardCacheMiddleware)(), dashboardController.getDashboard.bind(dashboardController));
router.get('/:providerId/equipment-stats', (0, cacheMiddleware_1.statsCacheMiddleware)(), dashboardController.getEquipmentStats.bind(dashboardController));
router.get('/:providerId/ticket-stats', (0, cacheMiddleware_1.statsCacheMiddleware)(), dashboardController.getTicketStats.bind(dashboardController));
router.get('/:providerId/password-stats', (0, cacheMiddleware_1.statsCacheMiddleware)(), dashboardController.getPasswordStats.bind(dashboardController));
exports.default = router;
