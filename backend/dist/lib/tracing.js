"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTracing = startTracing;
exports.stopTracing = stopTracing;
const sdk_node_1 = require("@opentelemetry/sdk-node");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
// Local fallback for deployment environment attribute when incubating entry-point isn't available
const ATTR_DEPLOYMENT_ENVIRONMENT = 'deployment.environment';
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
let sdk = null;
async function startTracing() {
    try {
        const enabled = (process.env.OTEL_ENABLED || 'false').toLowerCase() === 'true';
        if (!enabled || sdk)
            return;
        const serviceName = process.env.OTEL_SERVICE_NAME || 'telecom-backend';
        const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
        const exporter = new exporter_trace_otlp_http_1.OTLPTraceExporter({ url: endpoint });
        sdk = new sdk_node_1.NodeSDK({
            resource: new resources_1.Resource({
                [semantic_conventions_1.ATTR_SERVICE_NAME]: serviceName,
                [ATTR_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development'
            }),
            traceExporter: exporter,
            instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()]
        });
        await sdk.start();
        console.log('[OTEL] Tracing iniciado');
    }
    catch (err) {
        console.warn('[OTEL] Erro na configuração de tracing', err);
    }
}
async function stopTracing() {
    if (!sdk)
        return;
    try {
        await sdk.shutdown();
        console.log('[OTEL] Tracing finalizado');
    }
    catch (err) {
        console.warn('[OTEL] Falha ao finalizar tracing', err);
    }
    finally {
        sdk = null;
    }
}
