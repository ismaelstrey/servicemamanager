import { AuthUser } from '../types/auth.types';
import { PaginationMeta } from '../types/common.types';
import { ProviderService } from './providerService';
import { PasswordVaultRepository, CreatePasswordVaultData, ListPasswordVaultsQuery, PasswordVaultRecord, UpdatePasswordVaultData } from '../repositories/passwordVaultRepository';
import { decryptString, encryptString, maskSecret } from '../utils/encryptionUtils';
import { generatePassword } from '../utils/passwordUtils';

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

  private async canViewSecrets(user: AuthUser, providerId: number): Promise<boolean> {
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    return this.providerService.hasPermission(user, providerId, 'passwords:view');
  }

  async list(providerId: number, query: ListPasswordVaultsQuery, user: AuthUser): Promise<{ items: Omit<PasswordVaultRecord, 'password'>[]; pagination: PaginationMeta; }> {
    await this.assertAccess(user, providerId);
    return this.repository.listByProvider(providerId, query);
  }

  async create(providerId: number, data: CreatePasswordVaultData, user: AuthUser): Promise<Omit<PasswordVaultRecord, 'password'>> {
    await this.assertAccess(user, providerId);
    const encrypted = encryptString(data.password);
    const expiresAt = data.expiresAt ?? (data.rotationIntervalDays ? new Date(Date.now() + data.rotationIntervalDays * 24 * 60 * 60 * 1000) : undefined);
    const created = await this.repository.create(providerId, { ...data, password: encrypted, expiresAt });
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

    if (await this.canViewSecrets(user, rec.providerId)) {
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
    // Permitir atualização de expiração/intervalo de rotação
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt;
    }
    if (data.rotationIntervalDays !== undefined) {
      updateData.rotationIntervalDays = data.rotationIntervalDays;
    }
    const updated = await this.repository.update(id, updateData);
    if (!updated) {
      const err: any = new Error('Registro de senha não encontrado');
      err.status = 404;
      throw err;
    }

    if (await this.canViewSecrets(user, current.providerId)) {
      return { ...updated, password: data.password ? data.password : decryptString(updated.password) };
    }
    const { password, ...rest } = updated;
    return rest;
  }

  async rotate(id: number, user: AuthUser, options?: any): Promise<Omit<PasswordVaultRecord, 'password'> & { password?: string }> {
    const current = await this.repository.findById(id);
    if (!current) {
      const err: any = new Error('Registro de senha não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, current.providerId);

    // Verificar permissão de rotação
    const canRotate = await this.providerService.hasPermission(user, current.providerId, 'passwords:rotate');
    if (!canRotate) {
      const err: any = new Error('Permissão insuficiente para rotacionar senhas neste provedor');
      err.status = 403;
      throw err;
    }

    const newPlain = options?.password || generatePassword({
      length: options?.length ?? 16,
      includeUppercase: options?.includeUppercase ?? true,
      includeLowercase: options?.includeLowercase ?? true,
      includeNumbers: options?.includeNumbers ?? true,
      includeSymbols: options?.includeSymbols ?? true,
      excludeSimilar: options?.excludeSimilar ?? true,
      excludeAmbiguous: options?.excludeAmbiguous ?? false,
      customCharacters: options?.customCharacters,
      pattern: options?.pattern
    });
    const encrypted = encryptString(newPlain);
    const now = new Date();
    const expiresAt = current.rotationIntervalDays ? new Date(now.getTime() + current.rotationIntervalDays * 24 * 60 * 60 * 1000) : (current.expiresAt ?? undefined);

    const updated = await this.repository.update(id, { password: encrypted, lastRotatedAt: now, expiresAt });
    if (!updated) {
      const err: any = new Error('Registro de senha não encontrado');
      err.status = 404;
      throw err;
    }

    if (await this.canViewSecrets(user, current.providerId)) {
      return { ...updated, password: newPlain };
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