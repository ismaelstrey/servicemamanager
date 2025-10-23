import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { AuthenticatedRequest } from '../types/api.types';

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken<{ userId: number; email?: string; role?: string; providerId?: number }>(token);

    // Anexa usuário autenticado com id, role e providerId para controle de acesso
    req.user = { id: payload.userId, role: payload.role, providerId: payload.providerId } as any;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}