import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api.types';

// Middleware que resolve providerId do token (req.providerId) ou da query (?providerId=)
// e injeta como número em req.query.providerId antes da validação
export function providerContextMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Primeiro tenta do token
    if (typeof req.providerId === 'number' && Number.isFinite(req.providerId) && req.providerId > 0) {
      (req.query as any).providerId = req.providerId;
      return next();
    }

    // Fallback: tentar da query string
    const raw = (req.query as any)?.providerId;
    let resolved: number | undefined;

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (/^\d+$/.test(trimmed)) {
        const n = parseInt(trimmed, 10);
        if (Number.isFinite(n) && n > 0) resolved = n;
      }
    } else if (typeof raw === 'number') {
      if (Number.isFinite(raw) && raw > 0) resolved = Math.floor(raw);
    } else if (Array.isArray(raw)) {
      for (const item of raw) {
        const n = parseInt(String(item).trim(), 10);
        if (Number.isFinite(n) && n > 0) { resolved = n; break; }
      }
    }

    if (resolved && resolved > 0) {
      (req.query as any).providerId = resolved;
      return next();
    }

    return res.status(400).json({ success: false, message: 'providerId ausente ou inválido no contexto' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro no providerContextMiddleware', error: (err as Error).message });
  }
}