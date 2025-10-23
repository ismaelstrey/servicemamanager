"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const dashboardController = new dashboardController_1.DashboardController();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Rotas do dashboard
router.get('/:providerId', dashboardController.getDashboard.bind(dashboardController));
router.get('/:providerId/equipment-stats', dashboardController.getEquipmentStats.bind(dashboardController));
router.get('/:providerId/ticket-stats', dashboardController.getTicketStats.bind(dashboardController));
router.get('/:providerId/password-stats', dashboardController.getPasswordStats.bind(dashboardController));
exports.default = router;
