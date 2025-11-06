import { ApiService } from './api';

export interface CustomerListItem {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
}

export interface ListCustomersResponse {
  items: CustomerListItem[];
  total: number;
  page: number;
  limit: number;
}

export async function listCustomers(params: { search?: string; page?: number; limit?: number }): Promise<ListCustomersResponse> {
  const res = await ApiService.get<ListCustomersResponse>('/customers', { params });
  return res.data;
}