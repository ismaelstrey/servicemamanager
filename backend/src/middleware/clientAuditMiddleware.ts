import { Response, NextFunction } from 'express';
import { ClientAuthenticatedRequest } from '../types/customer.types';
import { logAudit, AuditLogData } from '../utils/auditLogger';

// Middleware de auditoria para ações do portal do cliente
export const clientAuditMiddleware = (
  resource: string,
  action?: string
) => {
  return (req: ClientAuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalJson = res.json;

    // Captura informações da requisição
    const ipAddress = req.ip || (req.connection as any)?.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const userId = req.customer?.id ? String(req.customer.id) : undefined;
    const userEmail = req.customer?.email;
    const providerId = req.customer?.providerId ? String(req.customer.providerId) : undefined;
    const resourceId = (req.params as any)?.id;

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
          method: (req as any).method,
          url: (req as any).originalUrl,
          statusCode: res.statusCode,
          requestBody: sanitizeRequestBody((req as any).body),
          timestamp: new Date().toISOString()
        }
      };

      // Registra o log de auditoria
      logAudit(auditData);

      // Chama o método original
      return originalSend.call(this, data);
    };

    // Substitui os métodos de resposta
    res.send = interceptResponse as any;
    res.json = function(this: Response, data: any) {
      return (interceptResponse as any).call(this, JSON.stringify(data));
    } as any;

    next();
  };
};

// Wrappers específicos para rotas do cliente
export const clientServiceOrderAuditMiddleware = clientAuditMiddleware('service_order');
export const clientCommentsAuditMiddleware = clientAuditMiddleware('comments');
export const clientAttachmentAuditMiddleware = clientAuditMiddleware('service_order_attachment');
export const clientQualificationAuditMiddleware = clientAuditMiddleware('service_order_qualification');

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
      return (parsed.message || parsed.error || 'Unknown error') as string;
    } catch {
      return data;
    }
  }

  if (typeof data === 'object' && data !== null) {
    return (data.message || data.error || 'Unknown error') as string;
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
    if ((sanitized as any)[field]) {
      (sanitized as any)[field] = '[REDACTED]';
    }
  }

  return sanitized;
}