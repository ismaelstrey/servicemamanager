"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerContextMiddleware = providerContextMiddleware;
// Middleware que resolve providerId do token (req.providerId) ou da query (?providerId=)
// e injeta como número em req.query.providerId antes da validação
function providerContextMiddleware(req, res, next) {
    try {
        // Primeiro tenta do token
        if (typeof req.providerId === 'number' && Number.isFinite(req.providerId) && req.providerId > 0) {
            req.query.providerId = req.providerId;
            return next();
        }
        // Fallback: tentar da query string
        const raw = req.query?.providerId;
        let resolved;
        if (typeof raw === 'string') {
            const trimmed = raw.trim();
            if (/^\d+$/.test(trimmed)) {
                const n = parseInt(trimmed, 10);
                if (Number.isFinite(n) && n > 0)
                    resolved = n;
            }
        }
        else if (typeof raw === 'number') {
            if (Number.isFinite(raw) && raw > 0)
                resolved = Math.floor(raw);
        }
        else if (Array.isArray(raw)) {
            for (const item of raw) {
                const n = parseInt(String(item).trim(), 10);
                if (Number.isFinite(n) && n > 0) {
                    resolved = n;
                    break;
                }
            }
        }
        if (resolved && resolved > 0) {
            req.query.providerId = resolved;
            return next();
        }
        return res.status(400).json({ success: false, message: 'providerId ausente ou inválido no contexto' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Erro no providerContextMiddleware', error: err.message });
    }
}
