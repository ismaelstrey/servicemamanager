"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const corsMiddleware_1 = require("../middleware/corsMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
// Rotas públicas para o widget de chat
const router = (0, express_1.Router)();
// Aplica CORS público e rate limit geral para todas as rotas do widget
router.use(corsMiddleware_1.publicCorsMiddleware);
router.use(rateLimitMiddleware_1.generalRateLimit);
// Endpoint de configuração do widget
// GET /chat/widget-config
router.get('/widget-config', (_req, res) => {
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
router.get('/events', (req, res) => {
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
exports.default = router;
