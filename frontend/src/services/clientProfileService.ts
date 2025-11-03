import { ApiService } from './api';
import type { ClientUser } from '../types/client';

// Serviço de perfil do cliente (Portal do Cliente)
// Responsável por atualizar dados básicos do perfil.
// Comentários em português BR conforme padrão do projeto.
export class ClientProfileService {
  // Atualiza dados do perfil do cliente autenticado
  static async updateProfile(data: Partial<ClientUser> & { phone?: string; document?: string; address?: any; avatar?: string }): Promise<ClientUser> {
    const res = await ApiService.put<{ success: boolean; customer: ClientUser }>(
      '/client/profile',
      data
    );
    return res.data.customer;
  }
}

export default ClientProfileService;