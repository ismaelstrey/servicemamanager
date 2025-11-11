"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResourceRateLimit = exports.aiRateLimit = exports.authRateLimit = exports.generalRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Rate limiter geral para todas as rotas
exports.generalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT || '100'), // máximo 100 requests por IP por janela de tempo
    message: {
        error: 'Muitas tentativas. Tente novamente em 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Muitas tentativas. Tente novamente em 15 minutos.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        });
    }
});
// Rate limiter mais restritivo para autenticação
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas de login por IP por janela de tempo
    message: {
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // não conta requests bem-sucedidos
    handler: (req, res) => {
        res.status(429).json({
            error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        });
    }
});
// Rate limiter para endpoints de IA (mais permissivo mas controlado)
exports.aiRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // máximo 10 requests por IP por minuto
    message: {
        error: 'Muitas requisições para IA. Tente novamente em 1 minuto.',
        code: 'AI_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Muitas requisições para IA. Tente novamente em 1 minuto.',
            code: 'AI_RATE_LIMIT_EXCEEDED',
            retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        });
    }
});
// Rate limiter para criação de recursos (tickets, ordens de serviço)
exports.createResourceRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // máximo 5 criações por IP por minuto
    message: {
        error: 'Muitas criações de recursos. Tente novamente em 1 minuto.',
        code: 'CREATE_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Muitas criações de recursos. Tente novamente em 1 minuto.',
            code: 'CREATE_RATE_LIMIT_EXCEEDED',
            retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        });
    }
});
