import { prisma } from '../lib/prisma';
// Avoid importing Prisma types that may not be exported; use any and local types
type ServiceOrder = any;
type Prisma = any;
import { ServiceOrderKanbanBoard, ServiceOrderStatus } from '../types/serviceOrder.types'

export class ServiceOrderRepository {
  private prisma: any;

  constructor() {
    this.prisma = prisma;
  }

  async findMany(params: {
    where?: any;
    skip?: number;
    take?: number;
    include?: any;
    orderBy?: any;
  }): Promise<ServiceOrder[]> {
    return await this.prisma.serviceOrder.findMany(params);
  }

  async findById(
    id: number,
    params?: {
      include?: any;
    }
  ): Promise<ServiceOrder | null> {
    return await this.prisma.serviceOrder.findUnique({
      where: { id },
      ...params
    });
  }

  async create(data: any): Promise<ServiceOrder> {
    return await this.prisma.serviceOrder.create({
      data,
      include: {
        provider: true,
        ticket: true
      }
    });
  }

  async update(
    id: number,
    data: any
  ): Promise<ServiceOrder> {
    return await this.prisma.serviceOrder.update({
      where: { id },
      data,
      include: {
        provider: true,
        ticket: true
      }
    });
  }

  async delete(id: number): Promise<ServiceOrder> {
    return await this.prisma.serviceOrder.delete({
      where: { id }
    });
  }

  async count(params: {
    where?: any;
  }): Promise<number> {
    return await this.prisma.serviceOrder.count(params);
  }

  async groupBy(params: any): Promise<any> {
    return await this.prisma.serviceOrder.groupBy(params);
  }

  async aggregate(params: any): Promise<any> {
    return await this.prisma.serviceOrder.aggregate(params);
  }

  async findByProvider(
    providerId: number,
    params?: {
      skip?: number;
      take?: number;
      include?: any;
      orderBy?: any;
    }
  ): Promise<ServiceOrder[]> {
    return await this.prisma.serviceOrder.findMany({
      where: { providerId },
      ...params
    });
  }

  async findByTicket(
    ticketId: number,
    params?: {
      include?: any;
    }
  ): Promise<ServiceOrder[]> {
    return await this.prisma.serviceOrder.findMany({
      where: { ticketId },
      ...params
    });
  }

  async findByStatus(
    status: string,
    params?: {
      skip?: number;
      take?: number;
      include?: any;
      orderBy?: any;
    }
  ): Promise<ServiceOrder[]> {
    return await this.prisma.serviceOrder.findMany({
      where: { status: status as any },
      ...params
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    params?: {
      skip?: number;
      take?: number;
      include?: any;
      orderBy?: any;
    }
  ): Promise<ServiceOrder[]> {
    return await this.prisma.serviceOrder.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      ...params
    });
  }

  async getKanbanByProvider(providerId: number): Promise<ServiceOrderKanbanBoard> {
    const items = await this.prisma.serviceOrder.findMany({
      where: { providerId },
      select: { id: true, title: true, priority: true, status: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' }
    });
    const board = {
      pending: [],
      in_progress: [],
      waiting_parts: [],
      waiting_client: [],
      completed: [],
      cancelled: []
    } as ServiceOrderKanbanBoard;
    for (const so of items as any[]) {
      const col = so.status as ServiceOrderStatus;
      if (!board[col]) continue;
      board[col].push({ id: so.id, title: so.title, priority: so.priority, updatedAt: so.updatedAt });
    }
    return board;
  }
}