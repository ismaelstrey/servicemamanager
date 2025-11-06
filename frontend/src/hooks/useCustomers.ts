import { listCustomers, type ListCustomersResponse } from '../services/customerService';

export function useCustomers() {
  async function searchCustomers(search: string, page = 1, limit = 10): Promise<ListCustomersResponse> {
    return listCustomers({ search, page, limit });
  }

  return {
    searchCustomers,
  };
}