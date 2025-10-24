import { ApiService, type PaginatedResponse } from './api';

// Interface para Ordem de Serviço
export interface ServiceOrder {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'installation' | 'maintenance' | 'repair' | 'inspection';
  category: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  location: string;
  estimatedHours: number;
  estimatedCost: number;
  dueDate: string;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Interface para criar/atualizar Ordem de Serviço
export interface CreateServiceOrderData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'installation' | 'maintenance' | 'repair' | 'inspection';
  category: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  location: string;
  estimatedHours: number;
  estimatedCost: number;
  dueDate: string;
  notes?: string;
  assignedTo?: string;
}

export interface UpdateServiceOrderData extends Partial<CreateServiceOrderData> {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

// Interface para filtros de busca
export interface ServiceOrderFilters {
  status?: string;
  priority?: string;
  type?: string;
  category?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interface para comentários
export interface ServiceOrderComment {
  id: string;
  serviceOrderId: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface CreateCommentData {
  content: string;
}

// Serviço para gerenciar Ordens de Serviço
export class ServiceOrderService {
  private static readonly BASE_URL = '/service-orders';

  // Listar ordens de serviço com filtros e paginação
  static async getServiceOrders(filters?: ServiceOrderFilters): Promise<PaginatedResponse<ServiceOrder>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${this.BASE_URL}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await ApiService.get<PaginatedResponse<ServiceOrder>>(url);
    return response.data;
  }

  // Obter uma ordem de serviço por ID
  static async getServiceOrderById(id: string): Promise<ServiceOrder> {
    const response = await ApiService.get<ServiceOrder>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  // Criar nova ordem de serviço
  static async createServiceOrder(data: CreateServiceOrderData): Promise<ServiceOrder> {
    const response = await ApiService.post<ServiceOrder>(this.BASE_URL, data);
    return response.data;
  }

  // Atualizar ordem de serviço
  static async updateServiceOrder(id: string, data: UpdateServiceOrderData): Promise<ServiceOrder> {
    const response = await ApiService.put<ServiceOrder>(`${this.BASE_URL}/${id}`, data);
    return response.data;
  }

  // Deletar ordem de serviço
  static async deleteServiceOrder(id: string): Promise<void> {
    await ApiService.delete(`${this.BASE_URL}/${id}`);
  }

  // Atualizar status da ordem de serviço
  static async updateServiceOrderStatus(
    id: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  ): Promise<ServiceOrder> {
    const response = await ApiService.patch<ServiceOrder>(`${this.BASE_URL}/${id}/status`, { status });
    return response.data;
  }

  // Obter comentários de uma ordem de serviço
  static async getServiceOrderComments(serviceOrderId: string): Promise<ServiceOrderComment[]> {
    const response = await ApiService.get<ServiceOrderComment[]>(`${this.BASE_URL}/${serviceOrderId}/comments`);
    return response.data;
  }

  // Adicionar comentário a uma ordem de serviço
  static async addServiceOrderComment(serviceOrderId: string, data: CreateCommentData): Promise<ServiceOrderComment> {
    const response = await ApiService.post<ServiceOrderComment>(`${this.BASE_URL}/${serviceOrderId}/comments`, data);
    return response.data;
  }

  // Obter estatísticas das ordens de serviço
  static async getServiceOrderStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const response = await ApiService.get<{
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
      cancelled: number;
      byPriority: Record<string, number>;
      byType: Record<string, number>;
      byCategory: Record<string, number>;
    }>(`${this.BASE_URL}/stats`);
    return response.data;
  }

  // Obter opções para filtros (categorias, tipos, etc.)
  static async getServiceOrderOptions(): Promise<{
    categories: string[];
    types: Array<{ value: string; label: string }>;
    priorities: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
  }> {
    const response = await ApiService.get<{
      categories: string[];
      types: Array<{ value: string; label: string }>;
      priorities: Array<{ value: string; label: string }>;
      statuses: Array<{ value: string; label: string }>;
    }>(`${this.BASE_URL}/options`);
    return response.data;
  }
}

export default ServiceOrderService;