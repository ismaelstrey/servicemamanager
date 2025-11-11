"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientQualificationAuditMiddleware = exports.clientAttachmentAuditMiddleware = exports.clientCommentsAuditMiddleware = exports.clientServiceOrderAuditMiddleware = exports.clientAuditMiddleware = void 0;
const auditLogger_1 = require("../utils/auditLogger");
// Middleware de auditoria para ações do portal do cliente
const clientAuditMiddleware = (resource, action) => {
    return (req, res, next) => {
        const originalSend = res.send;
        const originalJson = res.json;
        // Captura informações da requisição
        const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        const userId = req.customer?.id ? String(req.customer.id) : undefined;
        const userEmail = req.customer?.email;
        const providerId = req.customer?.providerId ? String(req.customer.providerId) : undefined;
        const resourceId = req.params?.id;
        // Determina a ação baseada no método HTTP se não especificada
        const auditAction = action || getActionFromMethod(req.method);
        // Intercepta a resposta para fazer log após o processamento
        const interceptResponse = function (data) {
            const success = res.statusCode >= 200 && res.statusCode < 400;
            // Dados de auditoria
            const auditData = {
                userId,
                userEmail,
                action: auditAction,
                resource,
                resourceId,
                providerId,
                ipAddress,
                userAgent,
                success,
                errorMessage: success ? undefined : getErrorMessage(data),
                metadata: {
                    method: req.method,
                    url: req.originalUrl,
                    statusCode: res.statusCode,
                    requestBody: sanitizeRequestBody(req.body),
                    timestamp: new Date().toISOString()
                }
            };
            // Registra o log de auditoria
            (0, auditLogger_1.logAudit)(auditData);
            // Chama o método original
            return originalSend.call(this, data);
        };
        // Substitui os métodos de resposta
        res.send = interceptResponse;
        res.json = function (data) {
            return interceptResponse.call(this, JSON.stringify(data));
        };
        next();
    };
};
exports.clientAuditMiddleware = clientAuditMiddleware;
// Wrappers específicos para rotas do cliente
exports.clientServiceOrderAuditMiddleware = (0, exports.clientAuditMiddleware)('service_order');
exports.clientCommentsAuditMiddleware = (0, exports.clientAuditMiddleware)('comments');
exports.clientAttachmentAuditMiddleware = (0, exports.clientAuditMiddleware)('service_order_attachment');
exports.clientQualificationAuditMiddleware = (0, exports.clientAuditMiddleware)('service_order_qualification');
// Funções auxiliares
function getActionFromMethod(method) {
    switch (method.toUpperCase()) {
        case 'GET':
            return 'read';
        case 'POST':
            return 'create';
        case 'PUT':
        case 'PATCH':
            return 'update';
        case 'DELETE':
            return 'delete';
        default:
            return 'unknown';
    }
}
function getErrorMessage(data) {
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return (parsed.message || parsed.error || 'Unknown error');
        }
        catch {
            return data;
        }
    }
    if (typeof data === 'object' && data !== null) {
        return (data.message || data.error || 'Unknown error');
    }
    return undefined;
}
function sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object') {
        return body;
    }
    const sanitized = { ...body };
    // Remove campos sensíveis
    const sensitiveFields = ['password', 'confirmPassword', 'token', 'refreshToken', 'secret', 'key'];
    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
}
