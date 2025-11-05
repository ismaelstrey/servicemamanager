import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
// Local fallback for deployment environment attribute when incubating entry-point isn't available
const ATTR_DEPLOYMENT_ENVIRONMENT = 'deployment.environment';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

let sdk: NodeSDK | null = null;

export async function startTracing() {
  try {
    const enabled = (process.env.OTEL_ENABLED || 'false').toLowerCase() === 'true';
    if (!enabled || sdk) return;

    const serviceName = process.env.OTEL_SERVICE_NAME || 'telecom-backend';
    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

    const exporter = new OTLPTraceExporter({ url: endpoint });

    sdk = new NodeSDK({
      resource: new Resource({
        [ATTR_SERVICE_NAME]: serviceName,
        [ATTR_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development'
      }),
      traceExporter: exporter,
      instrumentations: [getNodeAutoInstrumentations()]
    });

    await sdk.start();
    console.log('[OTEL] Tracing iniciado');
  } catch (err) {
    console.warn('[OTEL] Erro na configuração de tracing', err);
  }
}

export async function stopTracing() {
  if (!sdk) return;
  try {
    await sdk.shutdown();
    console.log('[OTEL] Tracing finalizado');
  } catch (err) {
    console.warn('[OTEL] Falha ao finalizar tracing', err);
  } finally {
    sdk = null;
  }
}