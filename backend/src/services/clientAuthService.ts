import { CustomerAuthService } from './customerAuthService';

export class ClientAuthService {
  private customerAuth: CustomerAuthService;

  constructor() {
    this.customerAuth = new CustomerAuthService();
  }

  async login(email: string, password: string) {
    return this.customerAuth.login(email, password);
  }

  async register(data: { name: string; email: string; password: string; providerId: number; role?: string; phone?: string; document?: string }) {
    return this.customerAuth.register(data);
  }

  async forgotPassword(email: string) {
    return this.customerAuth.forgotPassword(email);
  }

  async resetPassword(token: string, newPassword: string) {
    return this.customerAuth.resetPassword(token, newPassword);
  }
}