import { Response, NextFunction } from 'express';
import { ClientAuthenticatedRequest } from '../types/customer.types';

/**
 * Middleware de RBAC para clientes.
 * Exige que o cliente autenticado tenha um dos papéis permitidos.
 * Perfis suportados: 'customer_admin', 'customer_user'
 */
export function requireClientRole(allowedRoles: string[]) {
  return function (req: ClientAuthenticatedRequest, res: Response, next: NextFunction) {
    const role = req.customer?.role || 'customer_user';
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ success: false, message: 'Permissão insuficiente' });
    }
    next();
  };
}