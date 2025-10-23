import winston from 'winston';
import path from 'path';

// Configuração do logger de auditoria
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'telecom-backend-audit' },
  transports: [
    // Log de auditoria em arquivo separado
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'audit.log'),
      level: 'info'
    }),
    // Log de erros críticos em arquivo separado
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'audit-error.log'),
      level: 'error'
    })
  ]
});

// Em desenvolvimento, também loga no console
if (process.env.NODE_ENV !== 'production') {
  auditLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Interface para dados de auditoria
export interface AuditLogData {
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  providerId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// Função para registrar logs de auditoria
export const logAudit = (data: AuditLogData): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: data.success ? 'info' : 'error',
    ...data
  };

  if (data.success) {
    auditLogger.info('Audit Log', logEntry);
  } else {
    auditLogger.error('Audit Log - Error', logEntry);
  }
};

// Funções específicas para diferentes tipos de auditoria
export const logAuthAudit = (
  action: 'login' | 'register' | 'logout' | 'token_refresh',
  userId: string | undefined,
  userEmail: string | undefined,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string
): void => {
  logAudit({
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

export const logPasswordVaultAudit = (
  action: 'create' | 'read' | 'update' | 'delete' | 'decrypt',
  userId: string,
  userEmail: string,
  resourceId: string,
  providerId: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string,
  metadata?: Record<string, any>
): void => {
  logAudit({
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

export const logProviderAudit = (
  action: 'create' | 'read' | 'update' | 'delete',
  userId: string,
  userEmail: string,
  resourceId: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string,
  metadata?: Record<string, any>
): void => {
  logAudit({
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

export const logEquipmentAudit = (
  action: 'create' | 'read' | 'update' | 'delete',
  userId: string,
  userEmail: string,
  resourceId: string,
  providerId: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string,
  metadata?: Record<string, any>
): void => {
  logAudit({
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

export const logTicketAudit = (
  action: 'create' | 'read' | 'update' | 'delete' | 'status_change',
  userId: string,
  userEmail: string,
  resourceId: string,
  providerId: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string,
  metadata?: Record<string, any>
): void => {
  logAudit({
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

export const logServiceOrderAudit = (
  action: 'create' | 'read' | 'update' | 'delete' | 'status_change',
  userId: string,
  userEmail: string,
  resourceId: string,
  providerId: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string,
  metadata?: Record<string, any>
): void => {
  logAudit({
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

export default auditLogger;