import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';

// Middleware para proteger rotas com JWT
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Lê cabeçalho Authorization
  const authHeader: string | undefined = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }

  const token: string = authHeader.replace('Bearer ', '');
  try {
    const payload = verifyToken<{ userId: number }>(token);
    // @ts-expect-error anexar usuário ao request
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
}