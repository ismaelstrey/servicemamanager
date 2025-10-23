import { sign, verify, SignOptions, Secret, JwtPayload } from 'jsonwebtoken';

// Geração e verificação de tokens JWT
const jwtSecret: Secret = process.env.JWT_SECRET || 'dev-secret';

export function signToken(
  payload: object | string | Buffer,
  expiresInSeconds: number = 3600
): string {
  // Assina token com expiração em segundos
  const options: SignOptions = { expiresIn: expiresInSeconds };
  return sign(payload, jwtSecret, options);
}

export function verifyToken<T extends JwtPayload>(token: string): T {
  // Verifica token e retorna payload tipado
  return verify(token, jwtSecret) as T;
}