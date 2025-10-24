"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
