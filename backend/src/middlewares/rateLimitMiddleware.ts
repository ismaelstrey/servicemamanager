import rateLimit from 'express-rate-limit';
import { AuthenticatedRequest } from '../types/api.types';
import { Response } from 'express';

// Rate limiter geral para APIs
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela de tempo
  message: {
    error: 'Muitas requisições do mesmo IP, tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  handler: (req: AuthenticatedRequest, res: Response) => {
    res.status(429).json({
      error: 'Muitas requisições do mesmo IP, tente novamente em 15 minutos.',
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
    error: 'Muitas tentativas de login, tente novamente em 15 minutos.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não conta requests bem-sucedidos
  handler: (req: AuthenticatedRequest, res: Response) => {
    res.status(429).json({
      error: 'Muitas tentativas de login, tente novamente em 15 minutos.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit!.resetTime / 1000)
    });
  }
});

// Rate limiter para operações sensíveis (cofre de senhas)
export const sensitiveRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // máximo 20 requests por IP por janela de tempo
  message: {
    error: 'Muitas requisições para operações sensíveis, tente novamente em 5 minutos.',
    code: 'SENSITIVE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: AuthenticatedRequest, res: Response) => {
    res.status(429).json({
      error: 'Muitas requisições para operações sensíveis, tente novamente em 5 minutos.',
      code: 'SENSITIVE_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit!.resetTime / 1000)
    });
  }
});

// Rate limiter para criação de recursos
export const createResourceRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 30, // máximo 30 criações por IP por janela de tempo
  message: {
    error: 'Muitas criações de recursos, tente novamente em 10 minutos.',
    code: 'CREATE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: AuthenticatedRequest, res: Response) => {
    res.status(429).json({
      error: 'Muitas criações de recursos, tente novamente em 10 minutos.',
      code: 'CREATE_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit!.resetTime / 1000)
    });
  }
});