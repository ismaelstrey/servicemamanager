import { Response } from 'express';
import { CustomerAuthService } from '../services/customerAuthService';
import { ClientAuthenticatedRequest } from '../types/customer.types';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres')
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  providerId: z.coerce.number().int().positive('providerId inválido'),
  phone: z.string().optional(),
  document: z.string().optional()
});

const forgotSchema = z.object({
  email: z.string().email('Email inválido')
});

const resetSchema = z.object({
  token: z.string().min(32, 'Token inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres')
});

export class CustomerAuthController {
  private service: CustomerAuthService;

  constructor() {
    this.service = new CustomerAuthService();
  }

  async login(req: ClientAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten() });
        return;
      }
      const { email, password } = parsed.data;
      const result = await this.service.login(email, password);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao efetuar login do cliente';
      res.status(message.includes('Credenciais') ? 401 : 500).json({ success: false, message });
    }
  }

  async register(req: ClientAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten() });
        return;
      }
      const result = await this.service.register(parsed.data);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar cliente';
      res.status(500).json({ success: false, message });
    }
  }

  async profile(req: ClientAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const cid = req.customer?.id;
      if (!cid) {
        res.status(401).json({ message: 'Não autenticado' });
        return;
      }
      const customer = await this.service.profile(cid);
      res.json({ success: true, data: customer });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter perfil';
      res.status(500).json({ success: false, message });
    }
  }

  async forgotPassword(req: ClientAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = forgotSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten() });
        return;
      }
      const { email } = parsed.data;
      const result = await this.service.forgotPassword(email);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao iniciar recuperação de senha';
      res.status(500).json({ success: false, message });
    }
  }

  async resetPassword(req: ClientAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = resetSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten() });
        return;
      }
      const { token, password } = parsed.data;
      const result = await this.service.resetPassword(token, password);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao concluir recuperação de senha';
      const isTokenError = message.includes('Token inválido');
      res.status(isTokenError ? 400 : 500).json({ success: false, message });
    }
  }
}