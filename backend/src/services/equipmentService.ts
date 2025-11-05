import { AuthUser } from '../types/auth.types';
import { PaginationMeta } from '../types/common.types';
import { ProviderService } from './providerService';
import { EquipmentRepository, CreateEquipmentData, ListEquipmentsQuery, EquipmentRecord, UpdateEquipmentData } from '../repositories/equipmentRepository';
// Removed Prisma $Enums import; use string-based typing in repository
import { ChangeHistoryService } from './changeHistoryService';
import { logEquipmentAudit } from '../utils/auditLogger';
import { invalidateProviderCache, invalidateResourceCache } from '../middleware/cacheMiddleware';

export class EquipmentService {
  private repository: EquipmentRepository;
  private providerService: ProviderService;
  private changeHistoryService: ChangeHistoryService;

  constructor() {
    this.repository = new EquipmentRepository();
    this.providerService = new ProviderService();
    this.changeHistoryService = new ChangeHistoryService();
  }

  private async assertAccess(user: AuthUser, providerId: number): Promise<void> {
    if (user.role === 'super_admin' || user.role === 'admin') return;
    const allowed = await this.providerService.userHasAccess(user.id, providerId);
    if (!allowed) {
      const err: any = new Error('Acesso negado: usuário não possui acesso a este provedor');
      err.status = 403;
      throw err;
    }
  }

  async list(providerId: number, query: ListEquipmentsQuery, user: AuthUser): Promise<{
    equipments: EquipmentRecord[];
    pagination: PaginationMeta;
  }> {
    await this.assertAccess(user, providerId);
    return this.repository.listByProvider(providerId, query);
  }

  async create(providerId: number, data: CreateEquipmentData, user: AuthUser): Promise<EquipmentRecord> {
    await this.assertAccess(user, providerId);
    const created = await this.repository.create(providerId, data);
    logEquipmentAudit(
      'create',
      String(user.id),
      user.email,
      String(created.id),
      String(providerId),
      true
    );
    await invalidateProviderCache(String(providerId));
    await invalidateResourceCache('equipment', String(created.id));
    await invalidateResourceCache('stats');
    return created;
  }

  async getById(id: number, user: AuthUser): Promise<EquipmentRecord> {
    const equipment = await this.repository.findById(id);
    if (!equipment) {
      const err: any = new Error('Equipamento não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, equipment.providerId);
    logEquipmentAudit(
      'read',
      String(user.id),
      user.email,
      String(id),
      String(equipment.providerId),
      true
    );
    return equipment;
  }

  async update(id: number, data: UpdateEquipmentData, user: AuthUser): Promise<EquipmentRecord> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      const err: any = new Error('Equipamento não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, existing.providerId);
    const updated = await this.repository.update(id, data);
    if (!updated) {
      const err: any = new Error('Falha ao atualizar equipamento');
      err.status = 500;
      throw err;
    }

    // Registrar histórico se houve mudança de status
    if (typeof data.status !== 'undefined' && data.status !== existing.status) {
      await this.changeHistoryService.recordStatusChange('equipment', {
        entityId: id,
        providerId: existing.providerId,
        changedById: user.id,
        from: existing.status,
        to: data.status,
        metadata: { label: updated.label, serial: updated.serial }
      });
      logEquipmentAudit(
        'update',
        String(user.id),
        user.email,
        String(id),
        String(existing.providerId),
        true,
        undefined,
        undefined,
        undefined,
        { from: existing.status, to: data.status }
      );
      await invalidateProviderCache(String(existing.providerId));
      await invalidateResourceCache('equipment', String(id));
      await invalidateResourceCache('stats');
    }

    return updated;
  }

  async delete(id: number, user: AuthUser): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      const err: any = new Error('Equipamento não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, existing.providerId);
    const ok = await this.repository.delete(id);
    if (!ok) {
      const err: any = new Error('Falha ao remover equipamento');
      err.status = 500;
      throw err;
    }
    logEquipmentAudit(
      'delete',
      String(user.id),
      user.email,
      String(id),
      String(existing.providerId),
      true
    );
    await invalidateProviderCache(String(existing.providerId));
    await invalidateResourceCache('equipment', String(id));
    await invalidateResourceCache('stats');
    return true;
  }

  async getStats(providerId: number, user: AuthUser): Promise<{ total: number; byType: Record<string, number>; }> {
    await this.assertAccess(user, providerId);
    return this.repository.getStatsByProvider(providerId);
  }

  // Novo: listar histórico de mudanças do equipamento
  async getHistory(id: number, user: AuthUser, page?: number, limit?: number) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      const err: any = new Error('Equipamento não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, existing.providerId);
    return await this.changeHistoryService.listByEntity(existing.providerId, 'equipment', id, page, limit);
  }
}