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
    const res = await ApiService.get<{ success: boolean; data: ProviderListItem[]; pagination?: any }>(`/providers${query.toString() ? `?${query.toString()}` : ''}`);
    return res.data?.data ?? [];
  }

  static async getById(id: number): Promise<ProviderDetails | null> {
    const res = await ApiService.get<{ success: boolean; data: ProviderDetails }>(`/providers/${id}`);
    return res.data?.data ?? null;
  }
}

export default ProviderService;