import { IntegrationProcessingService } from '../services/integrationProcessingService';

let timer: NodeJS.Timeout | null = null;

export async function startWebhookProcessor(): Promise<void> {
  const enabled = process.env.WEBHOOK_PROCESSOR_ENABLED === 'true';
  const intervalMs = parseInt(process.env.WEBHOOK_PROCESSOR_INTERVAL_MS || '2000', 10);
  if (!enabled) {
    console.log('[WebhookProcessor] desativado (WEBHOOK_PROCESSOR_ENABLED != true)');
    return;
  }
  if (timer) return; // já iniciado

  const service = new IntegrationProcessingService();
  console.log(`[WebhookProcessor] iniciado com intervalo ${intervalMs}ms`);

  timer = setInterval(async () => {
    try {
      const { processed, failed } = await service.processPending(25);
      if (processed || failed) {
        console.log(`[WebhookProcessor] ciclo: processed=${processed}, failed=${failed}`);
      }
    } catch (err) {
      console.warn('[WebhookProcessor] erro de processamento', err);
    }
  }, Math.max(500, intervalMs));
}

export function stopWebhookProcessor(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log('[WebhookProcessor] parado');
  }
}