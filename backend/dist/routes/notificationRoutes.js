"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
const providerValidator_1 = require("../validators/providerValidator");
const notificationValidator_1 = require("../validators/notificationValidator");
const router = (0, express_1.Router)();
const controller = new notificationController_1.NotificationController();
// Listar notificações por provider com cache
router.get('/:providerId/notifications', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateParams)(notificationValidator_1.providerIdParamSchema), (0, providerValidator_1.validateQuery)(notificationValidator_1.listNotificationsSchema), (0, cacheMiddleware_1.cacheMiddleware)({
    ttl: 120,
    keyPrefix: 'notifications',
    varyBy: ['userId', 'providerId', 'params.providerId', 'query.page', 'query.limit', 'query.unread']
}), (req, res) => controller.list(req, res));
// Marcar uma notificação como lida
router.post('/notifications/:id/read', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateParams)(notificationValidator_1.notificationIdParamSchema), (req, res) => controller.markRead(req, res));
// Marcar todas as notificações de um provider como lidas
router.post('/:providerId/notifications/mark-all-read', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateParams)(notificationValidator_1.providerIdParamSchema), (req, res) => controller.markAllRead(req, res));
exports.default = router;
