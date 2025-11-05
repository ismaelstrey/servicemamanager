"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const integrationController_1 = require("../controllers/integrationController");
const router = (0, express_1.Router)();
const controller = new integrationController_1.IntegrationController();
// Webhooks (entradas)
router.post('/webhooks/whatsapp/evolution', (req, res) => controller.receiveEvolutionWebhook(req, res));
router.post('/webhooks/whatsapp/watiicket', (req, res) => controller.receiveWatiicketWebhook(req, res));
router.post('/webhooks/telegram', (req, res) => controller.receiveTelegramWebhook(req, res));
router.get('/webhooks/events', (req, res) => controller.listWebhookEvents(req, res));
// Envios (saídas)
router.post('/whatsapp/send', (req, res) => controller.sendWhatsAppMessage(req, res));
router.post('/telegram/send', (req, res) => controller.sendTelegramMessage(req, res));
exports.default = router;
