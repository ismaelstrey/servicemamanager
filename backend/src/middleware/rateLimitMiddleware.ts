import rateLimit from 'express-rate-limit';
import { Response } from 'express';
import { AuthenticatedRequest } from '../types/api.types';

// Rate limiter geral para todas as rotas
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT || '100'), // máximo 100 requests por IP por janela de tempo
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: AuthenticatedRequest, res: Response) => {
    res.status(429).json({
      error: 'Muitas tentativas. Tente novamente em 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit!.resetTime / 1000)
    });
  }
});

// Rate limiter mais restritivo para autenticação
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP por janela de tempo
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // não conta requests bem-sucedidos
  handler: (req: AuthenticatedRequest, res: Response) => {
    res.status(429).json({
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit!.resetTime / 1000)
    });
  }
});

// Rate limiter para endpoints de IA (mais permissivo mas controlado)
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 requests por IP por minuto
  message: {
    error: 'Muitas requisições para IA. Tente novamente em 1 minuto.',
    code: 'AI_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: AuthenticatedRequest, res: Response) => {
    res.status(429).json({
      error: 'Muitas requisições para IA. Tente novamente em 1 minuto.',
      code: 'AI_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit!.resetTime / 1000)
    });
  }
});

// Rate limiter para criação de recursos (tickets, ordens de serviço)
export const createResourceRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // máximo 5 criações por IP por minuto
  message: {
    error: 'Muitas criações de recursos. Tente novamente em 1 minuto.',
    code: 'CREATE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: AuthenticatedRequest, res: Response) => {
    res.status(429).json({
      error: 'Muitas criações de recursos. Tente novamente em 1 minuto.',
      code: 'CREATE_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit!.resetTime / 1000)
    });
  }
});