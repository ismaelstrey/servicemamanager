import { Router, Request, Response } from 'express';
import { publicCorsMiddleware } from '../middleware/corsMiddleware';
import { generalRateLimit } from '../middleware/rateLimitMiddleware';

// Rotas públicas para o widget de chat
const router = Router();

// Aplica CORS público e rate limit geral para todas as rotas do widget
router.use(publicCorsMiddleware);
router.use(generalRateLimit);

// Endpoint de configuração do widget
// GET /chat/widget-config
router.get('/widget-config', (_req: Request, res: Response) => {
  const environment = process.env.NODE_ENV || 'development';

  const config = {
    version: '1.0.0',
    environment,
    // Endpoint SSE público para fallback de eventos
    sseEndpoint: '/chat/events',
    // Configurações padrão do widget
    theme: 'dark',
    pollingFallback: false,
  };

  res.json(config);
});

// SSE fallback para eventos do widget
// GET /chat/events
router.get('/events', (req: Request, res: Response) => {
  // Cabeçalhos SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Permite CORS público (já aplicado via middleware) e flush imediato
  res.flushHeaders?.();

  // Evento inicial
  const initial = { type: 'open', ts: Date.now() };
  res.write(`event: open\n`);
  res.write(`data: ${JSON.stringify(initial)}\n\n`);

  // Heartbeat para manter a conexão viva
  const heartbeatMs = 30000; // 30s
  const interval = setInterval(() => {
    const payload = { type: 'ping', ts: Date.now() };
    res.write(`event: ping\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }, heartbeatMs);

  // Limpeza ao encerrar a conexão
  req.on('close', () => {
    clearInterval(interval);
  });
});

export default router;