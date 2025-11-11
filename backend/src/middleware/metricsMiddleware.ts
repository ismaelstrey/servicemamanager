import { Request, Response, NextFunction } from 'express';
import client, { Counter, Histogram, Registry } from 'prom-client';

// Create a dedicated registry to avoid conflicts
export const metricsRegistry: Registry = new client.Registry();

// Collect default metrics (process, event loop, memory, etc.)
client.collectDefaultMetrics({ register: metricsRegistry, prefix: 'telecom_backend_' });

// HTTP request counters and latency histogram
const httpRequestsTotal: Counter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [metricsRegistry]
});

const httpRequestErrorsTotal: Counter = new client.Counter({
  name: 'http_request_errors_total',
  help: 'Total de respostas HTTP com erro (status >= 400)',
  labelNames: ['method', 'route', 'status_code'],
  registers: [metricsRegistry]
});

const httpRequestDurationMs: Histogram = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duração das requisições HTTP em milissegundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 20, 50, 100, 300, 500, 1000, 2000, 5000],
  registers: [metricsRegistry]
});

// Express middleware to measure HTTP metrics
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(req.query)
  const method = req.method;
  const route = (req as any).route?.path || req.originalUrl.split('?')[0] || 'unknown';
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
export async function metricsRouteHandler(_req: Request, res: Response) {
  try {
    res.setHeader('Content-Type', metricsRegistry.contentType);
    const metrics = await metricsRegistry.metrics();
    res.status(200).send(metrics);
  } catch (err) {
    res.status(500).send(`# Metrics error: ${(err as Error).message}`);
  }
}

// Optional helpers to instrument queues/deliveries externally
export const deliveriesCounter: Counter = new client.Counter({
  name: 'outbound_deliveries_total',
  help: 'Total de envios realizados por workers outbound',
  labelNames: ['channel', 'result'],
  registers: [metricsRegistry]
});

export const queueErrorsCounter: Counter = new client.Counter({
  name: 'queue_errors_total',
  help: 'Total de erros em filas e workers',
  labelNames: ['queue', 'reason'],
  registers: [metricsRegistry]
});