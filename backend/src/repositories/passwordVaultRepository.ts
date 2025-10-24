import { PrismaClient } from '@prisma/client';
import { PaginationMeta } from '../types/common.types';

export interface CreatePasswordVaultData {
  label: string;
  username: string;
  password: string; // encrypted string (packed iv+tag+cipher)
  expiresAt?: Date;
  rotationIntervalDays?: number;
}

export interface UpdatePasswordVaultData {
  label?: string;
  username?: string;
  password?: string; // encrypted string
  expiresAt?: Date | null;
  rotationIntervalDays?: number | null;
  lastRotatedAt?: Date;
}

export interface ListPasswordVaultsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PasswordVaultRecord {
  id: number;
  label: string;
  username: string;
  password: string; // encrypted
  providerId: number;
  expiresAt?: Date | null;
  lastRotatedAt?: Date | null;
  rotationIntervalDays?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PasswordVaultRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(providerId: number, data: CreatePasswordVaultData): Promise<PasswordVaultRecord> {
    try {
      const rec = await this.prisma.passwordVault.create({
        data: {
          providerId,
          label: data.label,
          username: data.username,
          password: data.password,
          expiresAt: data.expiresAt,
          rotationIntervalDays: data.rotationIntervalDays
        }
      });
      return this.mapFromPrisma(rec);
    } catch (error) {
      console.error('Erro no PasswordVaultRepository.create:', error);
      throw new Error(`Erro ao criar senha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async listByProvider(providerId: number, query: ListPasswordVaultsQuery): Promise<{ items: Omit<PasswordVaultRecord, 'password'>[]; pagination: PaginationMeta; }> {
    try {
      const { page = 1, limit = 10, search } = query;
      const skip = (page - 1) * limit;

      const where: any = { providerId };
      if (search) {
        where.OR = [
          { label: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } }
        ];
      }

      const total = await this.prisma.passwordVault.count({ where });
      const rows = await this.prisma.passwordVault.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const items = rows.map((r) => {
        const m = this.mapFromPrisma(r);
        const { password, ...rest } = m;
        return rest;
      });

      const totalPages = Math.ceil(total / limit);
      const pagination: PaginationMeta = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };

      return { items, pagination };
    } catch (error) {
      console.error('Erro no PasswordVaultRepository.listByProvider:', error);
      throw new Error(`Erro ao listar senhas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async findById(id: number): Promise<PasswordVaultRecord | null> {
    try {
      const rec = await this.prisma.passwordVault.findUnique({ where: { id } });
      return rec ? this.mapFromPrisma(rec) : null;
    } catch (error) {
      console.error('Erro no PasswordVaultRepository.findById:', error);
      throw new Error(`Erro ao buscar senha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async update(id: number, data: UpdatePasswordVaultData): Promise<PasswordVaultRecord | null> {
    try {
      const rec = await this.prisma.passwordVault.update({
        where: { id },
        data: {
          label: data.label,
          username: data.username,
          password: data.password,
          expiresAt: data.expiresAt,
          rotationIntervalDays: data.rotationIntervalDays,
          lastRotatedAt: data.lastRotatedAt,
          updatedAt: new Date()
        }
      });
      return rec ? this.mapFromPrisma(rec) : null;
    } catch (error: any) {
      console.error('Erro no PasswordVaultRepository.update:', error);
      if (error.code === 'P2025') {
        return null;
      }
      throw new Error(`Erro ao atualizar senha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.passwordVault.delete({ where: { id } });
      return true;
    } catch (error: any) {
      console.error('Erro no PasswordVaultRepository.delete:', error);
      if (error.code === 'P2025') {
        return false;
      }
      throw new Error(`Erro ao remover senha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getStatsByProvider(providerId: number): Promise<{ total: number }> {
    try {
      const total = await this.prisma.passwordVault.count({ where: { providerId } });
      return { total };
    } catch (error) {
      console.error('Erro no PasswordVaultRepository.getStatsByProvider:', error);
      throw new Error(`Erro ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private mapFromPrisma(p: any): PasswordVaultRecord {
    return {
      id: p.id,
      label: p.label,
      username: p.username,
      password: p.password,
      providerId: p.providerId,
      expiresAt: p.expiresAt ?? null,
      lastRotatedAt: p.lastRotatedAt ?? null,
      rotationIntervalDays: p.rotationIntervalDays ?? null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    };
  }
}