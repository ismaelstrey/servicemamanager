import { ServiceOrderRepository } from '../repositories/serviceOrderRepository';
import { ProviderService } from './providerService';
import { AuthUser } from '../types/auth.types';
// Evitar dependência de enums de @prisma/client
import { ServiceOrderStatus, ServiceOrderPriority } from '../types/serviceOrder.types';
import { NotificationService } from './notificationService';
import { ChangeHistoryService } from './changeHistoryService';
import { logServiceOrderAudit } from '../utils/auditLogger';
import { invalidateProviderCache, invalidateResourceCache } from '../middleware/cacheMiddleware';

export interface CreateServiceOrderData {
  title: string;
  description: string;
  status?: ServiceOrderStatus;
  priority?: ServiceOrderPriority;
  scheduledDate?: Date;
  estimatedHours?: number;
  cost?: number;
  notes?: string;
  providerId: number;
  ticketId?: number;
}

export interface UpdateServiceOrderData {
  title?: string;
  description?: string;
  status?: ServiceOrderStatus;
  priority?: ServiceOrderPriority;
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  cost?: number;
  notes?: string;
  ticketId?: number;
}

export interface ServiceOrderFilters {
  status?: string;
  priority?: string;
  providerId?: number;
}

export interface ServiceOrderStats {
  total: number;
  byStatus: Record<ServiceOrderStatus, number>;
  byPriority: Record<ServiceOrderPriority, number>;
  averageCompletionTime: number;
  totalRevenue: number;
  pendingRevenue: number;
}

export class ServiceOrderService {
  private serviceOrderRepository: ServiceOrderRepository;
  private providerService: ProviderService;
  private notificationService: NotificationService;
  private changeHistoryService: ChangeHistoryService;

  constructor() {
    this.serviceOrderRepository = new ServiceOrderRepository();
    this.providerService = new ProviderService();
    this.notificationService = new NotificationService();
    this.changeHistoryService = new ChangeHistoryService();
  }

  async updateServiceOrder(user: AuthUser, id: number, data: UpdateServiceOrderData) {
    const existingServiceOrder = await this.getServiceOrderById(user, id);
    
    if (!existingServiceOrder) {
      return null;
    }

    // Auto-set timestamps based on status changes
    const updateData = { ...data } as UpdateServiceOrderData;
    
    if (data.status) {
      if (data.status === 'in_progress' && !existingServiceOrder.startedAt) {
        updateData.startedAt = new Date();
      } else if (data.status === 'completed' && !existingServiceOrder.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    const updated = await this.serviceOrderRepository.update(id, updateData);

    // Histórico e notificação de mudança de status
    if (typeof data.status !== 'undefined' && data.status !== existingServiceOrder.status) {
      await this.changeHistoryService.recordStatusChange('service_order', {
        entityId: id,
        providerId: existingServiceOrder.providerId,
        changedById: user.id,
        from: existingServiceOrder.status,
        to: data.status as any,
        metadata: { title: updated.title }
      });
      await this.notificationService.createStatusChangeNotification({
        entityType: 'service_order',
        entityId: id,
        providerId: existingServiceOrder.providerId,
        statusFrom: existingServiceOrder.status as any,
        statusTo: data.status as any,
        actorName: user.name,
        title: `OS #${id} atualizada`
      });
      logServiceOrderAudit(
        'status_change',
        String(user.id),
        user.email,
        String(id),
        String(existingServiceOrder.providerId),
        true,
        undefined,
        undefined,
        undefined,
        { from: existingServiceOrder.status, to: data.status }
      );
      await invalidateProviderCache(String(existingServiceOrder.providerId));
      await invalidateResourceCache('service-order', String(id));
      await invalidateResourceCache('stats');
    }

    return updated;
  }

  async getServiceOrders(
    user: AuthUser,
    page: number = 1,
    limit: number = 10,
    filters: ServiceOrderFilters = {}
  ) {
    // Validate provider access
    if (filters.providerId) {
      await this.providerService.findById(filters.providerId, user);
    }

    const offset = (page - 1) * limit;
    
    const whereClause: any = {};
    
    // Apply filters
    if (filters.status) {
      whereClause.status = filters.status as ServiceOrderStatus;
    }
    
    if (filters.priority) {
      whereClause.priority = filters.priority as ServiceOrderPriority;
    }
    
    if (filters.providerId) {
      whereClause.providerId = filters.providerId;
    } else if (user.role !== 'admin' && user.providerId) {
      // Non-admin users can only see service orders from their provider
      whereClause.providerId = user.providerId;
    }

    const [serviceOrders, total] = await Promise.all([
      this.serviceOrderRepository.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        include: {
          provider: true,
          ticket: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.serviceOrderRepository.count({ where: whereClause })
    ]);

    return {
      data: serviceOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getServiceOrderById(user: AuthUser, id: number) {
    const serviceOrder = await this.serviceOrderRepository.findById(id, {
      include: {
        provider: true,
        ticket: true
      }
    });

    if (!serviceOrder) {
      return null;
    }

    // Validate access
    await this.providerService.findById(serviceOrder.providerId, user);

    return serviceOrder;
  }

  async createServiceOrder(user: AuthUser, data: CreateServiceOrderData) {
    // Validate provider access
    await this.providerService.findById(data.providerId, user);

    // Validate ticket access if provided
    if (data.ticketId) {
      // TODO: Add ticket validation when ticket service is available
    }

    const serviceOrderData = {
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      scheduledDate: data.scheduledDate,
      estimatedHours: data.estimatedHours,
      cost: data.cost,
      notes: data.notes,
      provider: {
        connect: { id: data.providerId }
      },
      ticket: data.ticketId ? {
        connect: { id: data.ticketId }
      } : undefined
    };

    return await this.serviceOrderRepository.create(serviceOrderData);
  }

  async deleteServiceOrder(user: AuthUser, id: number): Promise<boolean> {
    const serviceOrder = await this.getServiceOrderById(user, id);
    
    if (!serviceOrder) {
      return false;
    }

    await this.serviceOrderRepository.delete(id);
    return true;
  }

  async updateServiceOrderStatus(user: AuthUser, id: number, status: ServiceOrderStatus) {
    return await this.updateServiceOrder(user, id, { status });
  }

  async getServiceOrderStats(user: AuthUser, providerId?: number): Promise<ServiceOrderStats> {
    let whereClause: any = {};
    
    if (providerId) {
      await this.providerService.findById(providerId, user);
      whereClause.providerId = providerId;
    } else if (user.role !== 'admin' && user.providerId) {
      whereClause.providerId = user.providerId;
    }

    const [
      total,
      statusResults,
      priorityResults,
      completedOrders,
      revenueData
    ] = await Promise.all([
      this.serviceOrderRepository.count({ where: whereClause }),
      this.serviceOrderRepository.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true
      }),
      this.serviceOrderRepository.groupBy({
        by: ['priority'],
        where: whereClause,
        _count: true
      }),
      this.serviceOrderRepository.findMany({
        where: {
          ...whereClause,
          status: 'completed',
          startedAt: { not: null },
          completedAt: { not: null }
        }
      }),
      this.serviceOrderRepository.aggregate({
        where: whereClause,
        _sum: {
          cost: true
        }
      })
    ]);

    // Convert grouped results to counts
    const statusCounts: Record<string, number> = {};
    statusResults.forEach((item: any) => {
      statusCounts[item.status] = item._count;
    });

    const priorityCounts: Record<string, number> = {};
    priorityResults.forEach((item: any) => {
      priorityCounts[item.priority] = item._count;
    });

    // Calculate average completion time
    let averageCompletionTime = 0;
    if (completedOrders.length > 0) {
      const totalTime = completedOrders.reduce((sum, order) => {
        if (order.startedAt && order.completedAt) {
          return sum + (order.completedAt.getTime() - order.startedAt.getTime());
        }
        return sum;
      }, 0);
      averageCompletionTime = totalTime / completedOrders.length / (1000 * 60 * 60); // Convert to hours
    }

    // Build status counts
    const byStatus = ['pending','in_progress','waiting_parts','waiting_client','completed','cancelled'].reduce((acc, status) => {
      acc[status as ServiceOrderStatus] = 0;
      return acc;
    }, {} as Record<ServiceOrderStatus, number>);

    Object.keys(statusCounts).forEach((status) => {
      byStatus[status as ServiceOrderStatus] = statusCounts[status];
    });

    // Build priority counts
    const byPriority = ['low','medium','high','urgent'].reduce((acc, priority) => {
      acc[priority as ServiceOrderPriority] = 0;
      return acc;
    }, {} as Record<ServiceOrderPriority, number>);

    Object.keys(priorityCounts).forEach((priority) => {
      byPriority[priority as ServiceOrderPriority] = priorityCounts[priority];
    });

    // Calculate pending revenue
    const pendingRevenue = await this.serviceOrderRepository.aggregate({
      where: {
        ...whereClause,
        status: {
          in: ['pending', 'in_progress']
        }
      },
      _sum: {
        cost: true
      }
    });

    return {
      total,
      byStatus,
      byPriority,
      averageCompletionTime,
      totalRevenue: revenueData._sum.cost || 0,
      pendingRevenue: pendingRevenue._sum.cost || 0
    };
  }

  async getKanban(user: AuthUser, providerId?: number) {
    const pid = providerId ?? (user.providerId || undefined);
    if (!pid) {
      const err: any = new Error('providerId obrigatório para Kanban');
      err.status = 400;
      throw err;
    }
    await this.providerService.findById(pid, user);
    return await this.serviceOrderRepository.getKanbanByProvider(pid);
  }
  // New: list change history for a service order
  async getHistory(user: AuthUser, id: number, page?: number, limit?: number) {
    const serviceOrder = await this.getServiceOrderById(user, id);
    if (!serviceOrder) {
      const err: any = new Error('Ordem de serviço não encontrada');
      err.status = 404;
      throw err;
    }
    return await this.changeHistoryService.listByEntity(serviceOrder.providerId, 'service_order', id, page, limit);
  }
}