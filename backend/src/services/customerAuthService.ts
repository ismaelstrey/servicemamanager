import { CustomerRepository } from '../repositories/customerRepository';
import { comparePassword, hashPassword } from '../utils/passwordUtils';
import { signToken } from '../utils/jwtUtils';
import crypto from 'crypto';

export class CustomerAuthService {
  private repo: CustomerRepository;

  constructor() {
    this.repo = new CustomerRepository();
  }

  async login(email: string, password: string) {
    const customer = await this.repo.findByEmail(email);
    if (!customer) {
      throw new Error('Cliente não encontrado');
    }
    if (!customer.isActive) {
      throw new Error('Cliente inativo');
    }
    const valid = await comparePassword(password, customer.password);
    if (!valid) {
      throw new Error('Credenciais inválidas');
    }

    const token = signToken({ customerId: customer.id, email: customer.email, providerId: customer.providerId, role: 'customer' });

    return {
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email, providerId: customer.providerId }
    };
  }

  async register(data: { name: string; email: string; password: string; providerId: number; phone?: string; document?: string }) {
    const passwordHash = await hashPassword(data.password);
    const created = await this.repo.create({
      name: data.name,
      email: data.email,
      password: passwordHash,
      providerId: data.providerId,
      phone: data.phone,
      document: data.document
    });

    const token = signToken({ customerId: created.id, email: created.email, providerId: created.providerId, role: 'customer' });

    return {
      token,
      customer: { id: created.id, name: created.name, email: created.email, providerId: created.providerId }
    };
  }

  async profile(customerId: number) {
    const customer = await this.repo.findById(customerId);
    if (!customer) throw new Error('Cliente não encontrado');
    return customer;
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; token?: string }> {
    const customer = await this.repo.findByEmail(email);
    // Responder sempre sucesso para evitar enumeração de usuários
    const successResponse = { success: true, message: 'Se existir, enviaremos instruções para recuperar a senha.' } as { success: boolean; message: string; token?: string };

    if (!customer || !customer.isActive) {
      return successResponse;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await this.repo.setResetToken(customer.email, token, expiresAt);

    if (process.env.NODE_ENV !== 'production') {
      successResponse.token = token;
    }
    return successResponse;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const customer = await this.repo.findByResetToken(token);
    if (!customer || !customer.resetTokenExpires) {
      throw new Error('Token inválido ou expirado');
    }
    const isExpired = new Date(customer.resetTokenExpires).getTime() < Date.now();
    if (isExpired) {
      throw new Error('Token inválido ou expirado');
    }

    const passwordHash = await hashPassword(newPassword);
    await this.repo.updatePasswordAndClearToken(customer.id, passwordHash);

    return { success: true, message: 'Senha atualizada com sucesso' };
  }

  async updateProfile(customerId: number, data: { name?: string; phone?: string; document?: string; address?: any }) {
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.document !== undefined) payload.document = data.document;
    if (data.address !== undefined) payload.address = data.address;

    if (Object.keys(payload).length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    const updated = await this.repo.updateProfile(customerId, payload);
    return updated;
  }
}