import { CustomerRepository } from '../repositories/customerRepository';

export class ClientProfileService {
  private repo: CustomerRepository;

  constructor() {
    this.repo = new CustomerRepository();
  }

  async getProfile(customerId: number) {
    const customer = await this.repo.findById(customerId);
    if (!customer) throw new Error('Cliente não encontrado');
    return customer;
  }

  async updateProfile(customerId: number, data: { name?: string; phone?: string; document?: string; address?: any }) {
    return this.repo.updateProfile(customerId, data);
  }
}