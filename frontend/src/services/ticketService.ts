import { ApiService, type PaginatedResponse } from './api';
import type { Ticket, TicketFilters } from '../types/ticket';

export class TicketService {
  static async getTickets(providerId: number, filters?: Partial<TicketFilters>, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Ticket>> {
    const params = new URLSearchParams();
    
    // Adicionar paginação
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    // Adicionar filtros
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const url = `/${providerId}/tickets${params.toString() ? `?${params.toString()}` : ''}`;
    const envelope = await ApiService.get<any>(url);
    return {
      data: envelope.data as Ticket[],
      pagination: (envelope as any).pagination,
    };
  }

  static async getTicketsAll(filters?: Partial<TicketFilters>, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Ticket>> {
    const params = new URLSearchParams();

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const url = `/tickets${params.toString() ? `?${params.toString()}` : ''}`;
    const envelope = await ApiService.get<any>(url);
    return {
      data: envelope.data as Ticket[],
      pagination: (envelope as any).pagination,
    };
  }

  static async getTicketById(id: number): Promise<Ticket> {
    const response = await ApiService.get<Ticket>(`/providers/tickets/${id}`);
    return response.data;
  }

  static async getTicketComments(id: number): Promise<import('../types/ticket').TicketComment[]> {
    const response = await ApiService.get<import('../types/ticket').TicketComment[]>(`/comments/ticket/${id}?includeInternal=true&_t=${Date.now()}`);
    return response.data;
  }

  static async createTicket(providerId: number, data: any): Promise<Ticket> {
    const response = await ApiService.post<Ticket>(`/${providerId}/tickets`, data);
    return response.data;
  }

  static async updateTicket(id: number, data: any): Promise<Ticket> {
    const response = await ApiService.put<Ticket>(`/providers/tickets/${id}`, data);
    return response.data;
  }

  static async updateTicketStatus(id: number, status: string): Promise<Ticket> {
    const response = await ApiService.put<Ticket>(`/providers/tickets/${id}/status`, { status });
    return response.data;
  }

  static async deleteTicket(id: number): Promise<void> {
    await ApiService.delete(`/tickets/${id}`);
  }
}

export default TicketService;
