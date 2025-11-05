import { Router } from 'express';
import { IntegrationController } from '../controllers/integrationController';

const router = Router();
const controller = new IntegrationController();

// Webhooks (entradas)
router.post('/webhooks/whatsapp/evolution', (req, res) => controller.receiveEvolutionWebhook(req, res));
router.post('/webhooks/whatsapp/watiicket', (req, res) => controller.receiveWatiicketWebhook(req, res));
router.post('/webhooks/telegram', (req, res) => controller.receiveTelegramWebhook(req, res));
router.get('/webhooks/events', (req, res) => controller.listWebhookEvents(req, res));

// Envios (saídas)
router.post('/whatsapp/send', (req, res) => controller.sendWhatsAppMessage(req, res));
router.post('/telegram/send', (req, res) => controller.sendTelegramMessage(req, res));

export default router;