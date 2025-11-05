"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebhookProcessor = startWebhookProcessor;
exports.stopWebhookProcessor = stopWebhookProcessor;
const integrationProcessingService_1 = require("../services/integrationProcessingService");
let timer = null;
async function startWebhookProcessor() {
    const enabled = process.env.WEBHOOK_PROCESSOR_ENABLED === 'true';
    const intervalMs = parseInt(process.env.WEBHOOK_PROCESSOR_INTERVAL_MS || '2000', 10);
    if (!enabled) {
        console.log('[WebhookProcessor] desativado (WEBHOOK_PROCESSOR_ENABLED != true)');
        return;
    }
    if (timer)
        return; // já iniciado
    const service = new integrationProcessingService_1.IntegrationProcessingService();
    console.log(`[WebhookProcessor] iniciado com intervalo ${intervalMs}ms`);
    timer = setInterval(async () => {
        try {
            const { processed, failed } = await service.processPending(25);
            if (processed || failed) {
                console.log(`[WebhookProcessor] ciclo: processed=${processed}, failed=${failed}`);
            }
        }
        catch (err) {
            console.warn('[WebhookProcessor] erro de processamento', err);
        }
    }, Math.max(500, intervalMs));
}
function stopWebhookProcessor() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        console.log('[WebhookProcessor] parado');
    }
}
