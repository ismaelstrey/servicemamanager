import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { loginSchema, registerSchema } from '../validators/authValidators';
import { logAuthAudit } from '../utils/auditLogger';

// Controller de autenticação para registro e login
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // POST /auth/register
  async register(req: Request, res: Response): Promise<void> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    let userEmail: string | undefined;

    try {
      const parse = registerSchema.safeParse(req.body);
      if (!parse.success) {
        res.status(400).json({ errors: parse.error.flatten() });
        return;
      }
      const { name, email, password } = parse.data;
      userEmail = email;
      
      const result = await this.authService.register(name, email, password);
      
      // Log de auditoria para registro bem-sucedido
      logAuthAudit('register', result.user?.id?.toString(), email, true, ipAddress, userAgent);
      
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar usuário';
      const isUniqueEmail = message.includes('Unique constraint') || message.includes('já existe');
      
      // Log de auditoria para registro falhado
      logAuthAudit('register', undefined, userEmail, false, ipAddress, userAgent, message);
      
      res.status(isUniqueEmail ? 409 : 500).json({ success: false, message });
    }
  }

  // POST /auth/login
  async login(req: Request, res: Response): Promise<void> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    let userEmail: string | undefined;

    try {
      const parse = loginSchema.safeParse(req.body);
      if (!parse.success) {
        res.status(400).json({ errors: parse.error.flatten() });
        return;
      }
      const { email, password } = parse.data;
      userEmail = email;
      
      const result = await this.authService.login(email, password);
      
      // Log de auditoria para login bem-sucedido
      logAuthAudit('login', result.user?.id?.toString(), email, true, ipAddress, userAgent);
      
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao efetuar login';
      
      // Log de auditoria para login falhado
      logAuthAudit('login', undefined, userEmail, false, ipAddress, userAgent, message);
      
      res.status(401).json({ success: false, message });
    }
  }
}