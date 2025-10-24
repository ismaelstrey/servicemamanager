import { ChangeHistoryRepository, CreateChangeHistoryData } from '../repositories/changeHistoryRepository';

export class ChangeHistoryService {
  private repo: ChangeHistoryRepository;

  constructor() {
    this.repo = new ChangeHistoryRepository();
  }

  async recordStatusChange(entityType: 'ticket' | 'service_order' | 'equipment', params: {
    entityId: number;
    providerId: number;
    changedById?: number | null;
    from?: string | null;
    to: string;
    metadata?: Record<string, any> | null;
  }) {
    const data: CreateChangeHistoryData = {
      entityType,
      entityId: params.entityId,
      providerId: params.providerId,
      changedById: params.changedById ?? null,
      field: 'status',
      oldValue: params.from ?? null,
      newValue: params.to,
      metadata: params.metadata ?? null
    };
    return await this.repo.create(data);
  }

  async listByEntity(providerId: number, entityType: 'ticket' | 'service_order' | 'equipment', entityId: number, page?: number, limit?: number) {
    return await this.repo.listByEntity(providerId, entityType, entityId, page, limit);
  }
}