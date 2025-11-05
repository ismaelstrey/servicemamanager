import { prisma } from '../lib/prisma';

export interface CreateChangeHistoryData {
  entityType: 'ticket' | 'service_order' | string;
  entityId: number;
  providerId: number;
  changedById?: number | null;
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
  metadata?: Record<string, any> | null;
}

export interface ChangeHistoryRecord {
  id: number;
  entityType: string;
  entityId: number;
  providerId: number;
  changedById?: number | null;
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
  metadata?: any;
  createdAt: Date;
}

export class ChangeHistoryRepository {
  private prisma: any;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: CreateChangeHistoryData): Promise<ChangeHistoryRecord> {
    const entry = await (this.prisma as any).changeHistory.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        providerId: data.providerId,
        changedById: data.changedById ?? null,
        field: data.field,
        oldValue: data.oldValue ?? null,
        newValue: data.newValue ?? null,
        metadata: data.metadata ?? null
      }
    });
    return entry as ChangeHistoryRecord;
  }

  async listByEntity(providerId: number, entityType: string, entityId: number, page = 1, limit = 20): Promise<{ history: ChangeHistoryRecord[]; total: number; page: number; limit: number; }>{
    const skip = (page - 1) * limit;
    const where = { providerId, entityType, entityId } as any;
    const [total, items] = await Promise.all([
      (this.prisma as any).changeHistory.count({ where }),
      (this.prisma as any).changeHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);
    return { history: items as ChangeHistoryRecord[], total, page, limit };
  }
}