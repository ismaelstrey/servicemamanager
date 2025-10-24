import { Response } from 'express';
import { CustomerAuthService } from '../services/customerAuthService';
import { ClientAuthenticatedRequest } from '../types/customer.types';

export class ClientProfileController {
  private service: CustomerAuthService;

  constructor() {
    this.service = new CustomerAuthService();
  }

  async update(req: ClientAuthenticatedRequest, res: Response) {
    try {
      const customerId = req.customer?.id;
      if (!customerId) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }

      const updated = await this.service.updateProfile(customerId, req.body);
      return res.json({ success: true, customer: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error?.message || 'Erro ao atualizar perfil' });
    }
  }
}