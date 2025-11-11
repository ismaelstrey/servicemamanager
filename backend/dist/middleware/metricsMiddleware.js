"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueErrorsCounter = exports.deliveriesCounter = exports.metricsRegistry = void 0;
exports.metricsMiddleware = metricsMiddleware;
exports.metricsRouteHandler = metricsRouteHandler;
const prom_client_1 = __importDefault(require("prom-client"));
// Create a dedicated registry to avoid conflicts
exports.metricsRegistry = new prom_client_1.default.Registry();
// Collect default metrics (process, event loop, memory, etc.)
prom_client_1.default.collectDefaultMetrics({ register: exports.metricsRegistry, prefix: 'telecom_backend_' });
// HTTP request counters and latency histogram
const httpRequestsTotal = new prom_client_1.default.Counter({
    name: 'http_requests_total',
    help: 'Total de requisições HTTP',
    labelNames: ['method', 'route', 'status_code'],
    registers: [exports.metricsRegistry]
});
const httpRequestErrorsTotal = new prom_client_1.default.Counter({
    name: 'http_request_errors_total',
    help: 'Total de respostas HTTP com erro (status >= 400)',
    labelNames: ['method', 'route', 'status_code'],
    registers: [exports.metricsRegistry]
});
const httpRequestDurationMs = new prom_client_1.default.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duração das requisições HTTP em milissegundos',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [5, 10, 20, 50, 100, 300, 500, 1000, 2000, 5000],
    registers: [exports.metricsRegistry]
});
// Express middleware to measure HTTP metrics
function metricsMiddleware(req, res, next) {
    const method = req.method;
    const route = req.route?.path || req.originalUrl.split('?')[0] || 'unknown';
    const endTimer = httpRequestDurationMs.startTimer();
    res.on('finish', () => {
        const statusCode = String(res.statusCode);
        httpRequestsTotal.inc({ method, route, status_code: statusCode });
        endTimer({ method, route, status_code: statusCode });
        if (res.statusCode >= 400) {
            httpRequestErrorsTotal.inc({ method, route, status_code: statusCode });
        }
    });
    next();
}
// Route handler to expose metrics
async function metricsRouteHandler(_req, res) {
    try {
        res.setHeader('Content-Type', exports.metricsRegistry.contentType);
        const metrics = await exports.metricsRegistry.metrics();
        res.status(200).send(metrics);
    }
    catch (err) {
        res.status(500).send(`# Metrics error: ${err.message}`);
    }
}
// Optional helpers to instrument queues/deliveries externally
exports.deliveriesCounter = new prom_client_1.default.Counter({
    name: 'outbound_deliveries_total',
    help: 'Total de envios realizados por workers outbound',
    labelNames: ['channel', 'result'],
    registers: [exports.metricsRegistry]
});
exports.queueErrorsCounter = new prom_client_1.default.Counter({
    name: 'queue_errors_total',
    help: 'Total de erros em filas e workers',
    labelNames: ['queue', 'reason'],
    registers: [exports.metricsRegistry]
});
