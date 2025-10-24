import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { ClientAuthenticatedRequest } from '../types/customer.types';

export function clientAuthMiddleware(req: ClientAuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken<{ customerId: number; email?: string; providerId?: number; role?: string }>(token);

    req.customer = { id: payload.customerId, email: payload.email!, providerId: payload.providerId } as any;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}