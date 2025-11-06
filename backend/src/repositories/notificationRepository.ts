import { prisma } from '../lib/prisma';

export interface CreateNotificationData {
  type: string;
  entityType: 'ticket' | 'service_order';
  entityId: number;
  title: string;
  message: string;
  statusFrom?: string | null;
  statusTo?: string | null;
  providerId: number;
  userId?: number | null;
  customerId?: number | null;
}

export interface ListNotificationsQuery {
  page?: number;
  limit?: number;
  unread?: boolean;
}

export interface NotificationRecord {
  id: number;
  type: string;
  entityType: string;
  entityId: number;
  title: string;
  message: string;
  statusFrom?: string | null;
  statusTo?: string | null;
  providerId: number;
  userId?: number | null;
  customerId?: number | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationRepository {
  private prisma: any;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: CreateNotificationData): Promise<NotificationRecord> {
    const notification = await (this.prisma as any).notification.create({
      data: {
        type: data.type,
        entityType: data.entityType,
        entityId: data.entityId,
        title: data.title,
        message: data.message,
        statusFrom: data.statusFrom ?? null,
        statusTo: data.statusTo ?? null,
        providerId: data.providerId,
        userId: data.userId ?? null,
        customerId: data.customerId ?? null
      }
    });
    return notification as NotificationRecord;
  }

  async listByProvider(providerId: number, query: ListNotificationsQuery): Promise<{ notifications: NotificationRecord[]; total: number; page: number; limit: number; }>{
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = { providerId };
    if (typeof query.unread === 'boolean') {
      where.isRead = !query.unread ? undefined : false;
    }

    const [total, items] = await Promise.all([
      (this.prisma as any).notification.count({ where }),
      (this.prisma as any).notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return { notifications: items as NotificationRecord[], total, page, limit };
  }

  async listByCustomer(customerId: number, providerId: number | undefined, query: ListNotificationsQuery): Promise<{ notifications: NotificationRecord[]; total: number; page: number; limit: number; }>{
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = { customerId };
    if (typeof providerId === 'number' && providerId > 0) {
      where.providerId = providerId;
    }
    if (typeof query.unread === 'boolean') {
      where.isRead = !query.unread ? undefined : false;
    }

    const [total, items] = await Promise.all([
      (this.prisma as any).notification.count({ where }),
      (this.prisma as any).notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return { notifications: items as NotificationRecord[], total, page, limit };
  }

  async markRead(id: number): Promise<boolean> {
    const updated = await (this.prisma as any).notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() }
    });
    return !!updated;
  }

  async markReadForCustomer(id: number, customerId: number): Promise<boolean> {
    const notification = await (this.prisma as any).notification.findFirst({ where: { id, customerId } });
    if (!notification) return false;
    const updated = await (this.prisma as any).notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() }
    });
    return !!updated;
  }

  async markAllReadByProvider(providerId: number): Promise<number> {
    const result = await (this.prisma as any).notification.updateMany({
      where: { providerId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });
    return result.count || 0;
  }
}