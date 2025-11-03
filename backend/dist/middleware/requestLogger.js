"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
// Campos sensíveis que não devem ser logados
const SENSITIVE_FIELDS = ['password', 'confirmPassword', 'token', 'refreshToken', 'secret', 'key'];
function sanitizeBody(body) {
    if (!body || typeof body !== 'object')
        return body;
    const copy = { ...body };
    for (const field of SENSITIVE_FIELDS) {
        if (field in copy)
            copy[field] = '[REDACTED]';
    }
    return copy;
}
function requestLogger(req, res, next) {
    // Apenas em desenvolvimento
    if ((process.env.NODE_ENV || 'development') !== 'development') {
        return next();
    }
    const start = process.hrtime();
    const { method } = req;
    const url = req.originalUrl || req.url;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    // Captura um snapshot do body para métodos não-GET
    const bodySnapshot = method === 'GET' ? undefined : sanitizeBody(req.body);
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const durationMs = (diff[0] * 1e3) + (diff[1] / 1e6);
        const status = res.statusCode;
        const length = res.getHeader('content-length') || '-';
        const base = `DEV-REQ ${method} ${url} ${status} ${durationMs.toFixed(1)}ms len:${length}`;
        const meta = `ip:${ip} ua:${userAgent}`;
        if (bodySnapshot) {
            console.log(`${base} ${meta} body:`, bodySnapshot);
        }
        else {
            console.log(`${base} ${meta}`);
        }
    });
    next();
}
