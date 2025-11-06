import { ServiceOrderRepository } from '../repositories/serviceOrderRepository';
import { CommentRepository } from '../repositories/commentRepository';

export class ClientServiceOrderService {
  private soRepo: ServiceOrderRepository;
  private commentRepo: CommentRepository;

  constructor() {
    this.soRepo = new ServiceOrderRepository();
    this.commentRepo = new CommentRepository();
  }

  async list(providerId: number, customerId: number, query?: { page?: number; limit?: number; status?: string; priority?: string; search?: string }) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const skip = (page - 1) * limit;
    const where: any = { providerId, customerId };
    if (query?.status) where.status = query.status;
    if (query?.priority) where.priority = query.priority;
    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      this.soRepo.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      this.soRepo.count({ where })
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: number, providerId: number, customerId: number) {
    const so = await this.soRepo.findById(id);
    if (!so || so.providerId !== providerId || so.customerId !== customerId) {
      const err: any = new Error('Ordem de serviço não encontrada');
      err.status = 404;
      throw err;
    }
    const comments = await this.commentRepo.findByResource('service_order', id, false);
    return { serviceOrder: so, comments };
  }

  async create(providerId: number, customerId: number, data: { title: string; description: string; priority?: string; scheduledDate?: Date }) {
    const so = await this.soRepo.create({
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      scheduledDate: data.scheduledDate,
      providerId,
      customerId
    });

    await this.commentRepo.create({
      content: data.description,
      resourceType: 'service_order',
      resourceId: so.id,
      providerId,
      customerId,
      isInternal: false
    } as any);

    return so;
  }

  async comment(serviceOrderId: number, providerId: number, customerId: number, content: string) {
    const so = await this.soRepo.findById(serviceOrderId);
    if (!so || so.providerId !== providerId || so.customerId !== customerId) {
      const err: any = new Error('Ordem de serviço não encontrada');
      err.status = 404;
      throw err;
    }
    return this.commentRepo.create({
      content,
      resourceType: 'service_order',
      resourceId: serviceOrderId,
      providerId,
      customerId,
      isInternal: false
    } as any);
  }

  async qualify(serviceOrderId: number, providerId: number, customerId: number, rating: number, feedback?: string) {
    const so = await this.soRepo.findById(serviceOrderId);
    if (!so || so.providerId !== providerId || so.customerId !== customerId) {
      const err: any = new Error('Ordem de serviço não encontrada');
      err.status = 404;
      throw err;
    }
    const updated = await this.soRepo.update(serviceOrderId, {
      customerRating: rating,
      customerFeedback: feedback
    });
    return updated;
  }

  async update(serviceOrderId: number, providerId: number, customerId: number, data: { title?: string; description?: string; priority?: string; scheduledDate?: Date }) {
    const so = await this.soRepo.findById(serviceOrderId);
    if (!so || so.providerId !== providerId || so.customerId !== customerId) {
      const err: any = new Error('Ordem de serviço não encontrada');
      err.status = 404;
      throw err;
    }
    return this.soRepo.update(serviceOrderId, data);
  }
}