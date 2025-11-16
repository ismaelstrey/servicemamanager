import { ApiService } from './api';

export interface ProviderListItem {
  id: number;
  name: string;
  workspace: string;
  email?: string;
}

export interface ProviderDetails extends ProviderListItem {
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export class ProviderService {
  static async listProviders(params?: { page?: number; limit?: number; search?: string }): Promise<ProviderListItem[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, String(value));
        }
      });
    }
    const res = await ApiService.get<ProviderListItem[]>(`/providers${query.toString() ? `?${query.toString()}` : ''}`);
    return res.data;
  }

  static async getById(id: number): Promise<ProviderDetails | null> {
    const res = await ApiService.get<ProviderDetails>(`/providers/${id}`);
    return res.data;
  }

  static async updateSettings(id: number, settings: any): Promise<any> {
    const res = await ApiService.put<any>(`/providers/${id}/settings`, settings);
    return res.data;
  }

  static async update(id: number, data: Partial<{ name: string; email?: string; phone?: string; website?: string; cnpj?: string; description?: string; logo?: string }>): Promise<any> {
    const res = await ApiService.put<any>(`/providers/${id}`, data);
    return res.data;
  }
}

export default ProviderService;