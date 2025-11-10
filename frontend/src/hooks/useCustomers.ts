import { listCustomers, type ListCustomersResponse } from '../services/customerService';

export function useCustomers() {
  async function searchCustomers(search: string, page = 1, limit = 10): Promise<ListCustomersResponse> {
    // Comentário: Normaliza busca vazia para undefined, evitando erros de validação (min length)
    const normalizedSearch = (search && search.trim().length > 0) ? search.trim() : undefined;
    return listCustomers({ search: normalizedSearch, page, limit });
  }

  return {
    searchCustomers,
  };
}