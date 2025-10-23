import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { logAudit, AuditLogData } from '../utils/auditLogger';

// Middleware para auditoria automática de operações críticas
export const auditMiddleware = (
  resource: string,
  action?: string
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Captura informações da requisição
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const userId = req.user?.id?.toString();
    const userEmail = req.user?.email;
    const providerId = req.providerId?.toString();
    const resourceId = req.params.id;
    
    // Determina a ação baseada no método HTTP se não especificada
    const auditAction = action || getActionFromMethod(req.method);
    
    // Intercepta a resposta para fazer log após o processamento
    const interceptResponse = function(this: Response, data: any) {
      const success = res.statusCode >= 200 && res.statusCode < 400;
      
      // Dados de auditoria
      const auditData: AuditLogData = {
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
      logAudit(auditData);
      
      // Chama o método original
      return originalSend.call(this, data);
    };
    
    // Substitui os métodos de resposta
    res.send = interceptResponse;
    res.json = function(this: Response, data: any) {
      return interceptResponse.call(this, JSON.stringify(data));
    };
    
    next();
  };
};

// Middleware específico para operações de autenticação
export const authAuditMiddleware = auditMiddleware('auth');

// Middleware específico para operações de provedores
export const providerAuditMiddleware = auditMiddleware('provider');

// Middleware específico para operações de equipamentos
export const equipmentAuditMiddleware = auditMiddleware('equipment');

// Middleware específico para operações de tickets
export const ticketAuditMiddleware = auditMiddleware('ticket');

// Middleware específico para operações de ordens de serviço
export const serviceOrderAuditMiddleware = auditMiddleware('service_order');

// Middleware específico para operações de cofre de senhas
export const passwordVaultAuditMiddleware = auditMiddleware('password_vault');

// Middleware específico para operações de IA
export const aiAuditMiddleware = auditMiddleware('ai');

// Funções auxiliares
function getActionFromMethod(method: string): string {
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

function getErrorMessage(data: any): string | undefined {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return parsed.message || parsed.error || 'Unknown error';
    } catch {
      return data;
    }
  }
  
  if (typeof data === 'object' && data !== null) {
    return data.message || data.error || 'Unknown error';
  }
  
  return undefined;
}

function sanitizeRequestBody(body: any): any {
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