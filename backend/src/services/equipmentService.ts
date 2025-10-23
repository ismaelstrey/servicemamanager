import { AuthUser } from '../types/auth.types';
import { PaginationMeta } from '../types/common.types';
import { ProviderService } from './providerService';
import { EquipmentRepository, CreateEquipmentData, ListEquipmentsQuery, EquipmentRecord, UpdateEquipmentData } from '../repositories/equipmentRepository';
import { $Enums } from '@prisma/client';

export class EquipmentService {
  private repository: EquipmentRepository;
  private providerService: ProviderService;

  constructor() {
    this.repository = new EquipmentRepository();
    this.providerService = new ProviderService();
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
    return this.repository.create(providerId, data);
  }

  async getById(id: number, user: AuthUser): Promise<EquipmentRecord> {
    const equipment = await this.repository.findById(id);
    if (!equipment) {
      const err: any = new Error('Equipamento não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, equipment.providerId);
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
    return true;
  }

  async getStats(providerId: number, user: AuthUser): Promise<{ total: number; byType: Record<$Enums.EquipmentType, number>; }> {
    await this.assertAccess(user, providerId);
    return this.repository.getStatsByProvider(providerId);
  }
}