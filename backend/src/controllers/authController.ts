import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { loginSchema, registerSchema } from '../validators/authValidators';

// Controller de autenticação para registro e login
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // POST /auth/register
  async register(req: Request, res: Response): Promise<void> {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ errors: parse.error.flatten() });
      return;
    }
    const { name, email, password } = parse.data;
    const result = await this.authService.register(name, email, password);
    res.status(201).json(result);
  }

  // POST /auth/login
  async login(req: Request, res: Response): Promise<void> {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ errors: parse.error.flatten() });
      return;
    }
    const { email, password } = parse.data;
    const result = await this.authService.login(email, password);
    if (!result) {
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }
    res.json(result);
  }
}