import { PrismaClient, ServiceOrder, Prisma } from '@prisma/client';

export class ServiceOrderRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findMany(params: {
    where?: Prisma.ServiceOrderWhereInput;
    skip?: number;
    take?: number;
    include?: Prisma.ServiceOrderInclude;
    orderBy?: Prisma.ServiceOrderOrderByWithRelationInput;
  }): Promise<ServiceOrder[]> {
    return await this.prisma.serviceOrder.findMany(params);
  }

  async findById(
    id: number,
    params?: {
      include?: Prisma.ServiceOrderInclude;
    }
  ): Promise<ServiceOrder | null> {
    return await this.prisma.serviceOrder.findUnique({
      where: { id },
      ...params
    });
  }

  async create(data: Prisma.ServiceOrderCreateInput): Promise<ServiceOrder> {
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
    data: Prisma.ServiceOrderUpdateInput
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
    where?: Prisma.ServiceOrderWhereInput;
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
      include?: Prisma.ServiceOrderInclude;
      orderBy?: Prisma.ServiceOrderOrderByWithRelationInput;
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
      include?: Prisma.ServiceOrderInclude;
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
      include?: Prisma.ServiceOrderInclude;
      orderBy?: Prisma.ServiceOrderOrderByWithRelationInput;
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
      include?: Prisma.ServiceOrderInclude;
      orderBy?: Prisma.ServiceOrderOrderByWithRelationInput;
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
}