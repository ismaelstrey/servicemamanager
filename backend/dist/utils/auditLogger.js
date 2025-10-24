"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logServiceOrderAudit = exports.logTicketAudit = exports.logEquipmentAudit = exports.logProviderAudit = exports.logPasswordVaultAudit = exports.logAuthAudit = exports.logAudit = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Configuração do logger de auditoria
const auditLogger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    defaultMeta: { service: 'telecom-backend-audit' },
    transports: [
        // Log de auditoria em arquivo separado
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'audit.log'),
            level: 'info'
        }),
        // Log de erros críticos em arquivo separado
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'audit-error.log'),
            level: 'error'
        })
    ]
});
// Em desenvolvimento, também loga no console
if (process.env.NODE_ENV !== 'production') {
    auditLogger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    }));
}
// Função para registrar logs de auditoria
const logAudit = (data) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: data.success ? 'info' : 'error',
        ...data
    };
    if (data.success) {
        auditLogger.info('Audit Log', logEntry);
    }
    else {
        auditLogger.error('Audit Log - Error', logEntry);
    }
};
exports.logAudit = logAudit;
// Funções específicas para diferentes tipos de auditoria
const logAuthAudit = (action, userId, userEmail, success, ipAddress, userAgent, errorMessage) => {
    (0, exports.logAudit)({
        userId,
        userEmail,
        action,
        resource: 'auth',
        ipAddress,
        userAgent,
        success,
        errorMessage
    });
};
exports.logAuthAudit = logAuthAudit;
const logPasswordVaultAudit = (action, userId, userEmail, resourceId, providerId, success, ipAddress, userAgent, errorMessage, metadata) => {
    (0, exports.logAudit)({
        userId,
        userEmail,
        action,
        resource: 'password_vault',
        resourceId,
        providerId,
        ipAddress,
        userAgent,
        success,
        errorMessage,
        metadata
    });
};
exports.logPasswordVaultAudit = logPasswordVaultAudit;
const logProviderAudit = (action, userId, userEmail, resourceId, success, ipAddress, userAgent, errorMessage, metadata) => {
    (0, exports.logAudit)({
        userId,
        userEmail,
        action,
        resource: 'provider',
        resourceId,
        ipAddress,
        userAgent,
        success,
        errorMessage,
        metadata
    });
};
exports.logProviderAudit = logProviderAudit;
const logEquipmentAudit = (action, userId, userEmail, resourceId, providerId, success, ipAddress, userAgent, errorMessage, metadata) => {
    (0, exports.logAudit)({
        userId,
        userEmail,
        action,
        resource: 'equipment',
        resourceId,
        providerId,
        ipAddress,
        userAgent,
        success,
        errorMessage,
        metadata
    });
};
exports.logEquipmentAudit = logEquipmentAudit;
const logTicketAudit = (action, userId, userEmail, resourceId, providerId, success, ipAddress, userAgent, errorMessage, metadata) => {
    (0, exports.logAudit)({
        userId,
        userEmail,
        action,
        resource: 'ticket',
        resourceId,
        providerId,
        ipAddress,
        userAgent,
        success,
        errorMessage,
        metadata
    });
};
exports.logTicketAudit = logTicketAudit;
const logServiceOrderAudit = (action, userId, userEmail, resourceId, providerId, success, ipAddress, userAgent, errorMessage, metadata) => {
    (0, exports.logAudit)({
        userId,
        userEmail,
        action,
        resource: 'service_order',
        resourceId,
        providerId,
        ipAddress,
        userAgent,
        success,
        errorMessage,
        metadata
    });
};
exports.logServiceOrderAudit = logServiceOrderAudit;
exports.default = auditLogger;
