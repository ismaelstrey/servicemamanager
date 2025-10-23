import { AuthUser } from '../types/auth.types';
import { PaginationMeta } from '../types/common.types';
import { ProviderService } from './providerService';
import { PasswordVaultRepository, CreatePasswordVaultData, ListPasswordVaultsQuery, PasswordVaultRecord, UpdatePasswordVaultData } from '../repositories/passwordVaultRepository';
import { decryptString, encryptString, maskSecret } from '../utils/encryptionUtils';

export class PasswordVaultService {
  private repository: PasswordVaultRepository;
  private providerService: ProviderService;

  constructor() {
    this.repository = new PasswordVaultRepository();
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

  private canViewSecrets(user: AuthUser): boolean {
    return user.role === 'super_admin' || user.role === 'admin' || user.role === 'manager';
  }

  async list(providerId: number, query: ListPasswordVaultsQuery, user: AuthUser): Promise<{ items: Omit<PasswordVaultRecord, 'password'>[]; pagination: PaginationMeta; }> {
    await this.assertAccess(user, providerId);
    return this.repository.listByProvider(providerId, query);
  }

  async create(providerId: number, data: CreatePasswordVaultData, user: AuthUser): Promise<Omit<PasswordVaultRecord, 'password'>> {
    await this.assertAccess(user, providerId);
    const encrypted = encryptString(data.password);
    const created = await this.repository.create(providerId, { ...data, password: encrypted });
    const { password, ...rest } = created;
    return rest;
  }

  async getById(id: number, user: AuthUser): Promise<Omit<PasswordVaultRecord, 'password'> & { password?: string }> {
    const rec = await this.repository.findById(id);
    if (!rec) {
      const err: any = new Error('Registro de senha não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, rec.providerId);

    if (this.canViewSecrets(user)) {
      return { ...rec, password: decryptString(rec.password) };
    }
    const { password, ...rest } = rec;
    return rest;
  }

  async update(id: number, data: UpdatePasswordVaultData, user: AuthUser): Promise<Omit<PasswordVaultRecord, 'password'> & { password?: string }> {
    const current = await this.repository.findById(id);
    if (!current) {
      const err: any = new Error('Registro de senha não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, current.providerId);

    const updateData: UpdatePasswordVaultData = { ...data };
    if (data.password) {
      updateData.password = encryptString(data.password);
    }
    const updated = await this.repository.update(id, updateData);
    if (!updated) {
      const err: any = new Error('Registro de senha não encontrado');
      err.status = 404;
      throw err;
    }

    if (this.canViewSecrets(user)) {
      return { ...updated, password: data.password ? data.password : decryptString(updated.password) };
    }
    const { password, ...rest } = updated;
    return rest;
  }

  async delete(id: number, user: AuthUser): Promise<boolean> {
    const current = await this.repository.findById(id);
    if (!current) {
      const err: any = new Error('Registro de senha não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, current.providerId);
    return this.repository.delete(id);
  }
}