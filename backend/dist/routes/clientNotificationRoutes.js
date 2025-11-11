"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientNotificationController_1 = require("../controllers/clientNotificationController");
const clientAuthMiddleware_1 = require("../middlewares/clientAuthMiddleware");
const providerValidator_1 = require("../validators/providerValidator");
const notificationValidator_1 = require("../validators/notificationValidator");
const router = (0, express_1.Router)();
const controller = new clientNotificationController_1.ClientNotificationController();
// Listar notificações do cliente autenticado
router.get('/', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateQuery)(notificationValidator_1.listNotificationsSchema), (req, res) => controller.list(req, res));
// Marcar notificação do cliente como lida
router.put('/:id/read', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(notificationValidator_1.notificationIdParamSchema), (req, res) => controller.markRead(req, res));
exports.default = router;
