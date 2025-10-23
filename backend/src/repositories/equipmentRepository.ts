// Repositório para acesso aos dados de Equipamentos

import { PrismaClient, $Enums } from '@prisma/client';
import { PaginationMeta } from '../types/common.types';

export interface CreateEquipmentData {
  label: string;
  type: $Enums.EquipmentType;
  serial: string;
  status?: $Enums.EquipmentStatus; // active | inactive | maintenance
}

export interface UpdateEquipmentData {
  label?: string;
  type?: $Enums.EquipmentType;
  serial?: string;
  status?: $Enums.EquipmentStatus; // active | inactive | maintenance
}

export interface ListEquipmentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: $Enums.EquipmentType;
  status?: $Enums.EquipmentStatus;
}

export interface EquipmentRecord {
  id: number;
  label: string;
  type: $Enums.EquipmentType;
  serial: string;
  status: $Enums.EquipmentStatus;
  providerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class EquipmentRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Criar equipamento
   */
  async create(providerId: number, data: CreateEquipmentData): Promise<EquipmentRecord> {
    try {
      const equipment = await this.prisma.equipment.create({
        data: {
          providerId,
          label: data.label,
          type: data.type,
          serial: data.serial,
          status: data.status
        }
      });

      return this.mapFromPrisma(equipment);
    } catch (error: any) {
      console.error('Erro no EquipmentRepository.create:', error);
      if (error.code === 'P2002') {
        throw new Error('Serial já está em uso');
      }
      throw new Error(`Erro ao criar equipamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Listar equipamentos por provider com paginação
   */
  async listByProvider(providerId: number, query: ListEquipmentsQuery): Promise<{
    equipments: EquipmentRecord[];
    pagination: PaginationMeta;
  }> {
    try {
      const { page = 1, limit = 10, search, type, status } = query;
      const skip = (page - 1) * limit;

      const where: any = { providerId };
      if (search) {
        where.OR = [
          { label: { contains: search, mode: 'insensitive' } },
          { serial: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (type) {
        where.type = { equals: type };
      }
      if (status) {
        where.status = { equals: status };
      }

      const total = await this.prisma.equipment.count({ where });

      const items = await this.prisma.equipment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const equipments = items.map((e) => this.mapFromPrisma(e));
      const pagination: PaginationMeta = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };

      return { equipments, pagination };
    } catch (error) {
      console.error('Erro no EquipmentRepository.listByProvider:', error);
      throw new Error(`Erro ao listar equipamentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async findById(id: number): Promise<EquipmentRecord | null> {
    try {
      const equipment = await this.prisma.equipment.findUnique({ where: { id } });
      return equipment ? this.mapFromPrisma(equipment) : null;
    } catch (error) {
      console.error('Erro no EquipmentRepository.findById:', error);
      throw new Error(`Erro ao buscar equipamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async update(id: number, data: UpdateEquipmentData): Promise<EquipmentRecord | null> {
    try {
      const equipment = await this.prisma.equipment.update({
        where: { id },
        data: {
          label: data.label,
          type: data.type,
          serial: data.serial,
          status: data.status,
          updatedAt: new Date()
        }
      });
      return equipment ? this.mapFromPrisma(equipment) : null;
    } catch (error: any) {
      console.error('Erro no EquipmentRepository.update:', error);
      if (error.code === 'P2002') {
        throw new Error('Serial já está em uso');
      }
      if (error.code === 'P2025') {
        return null;
      }
      throw new Error(`Erro ao atualizar equipamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.equipment.delete({ where: { id } });
      return true;
    } catch (error: any) {
      console.error('Erro no EquipmentRepository.delete:', error);
      if (error.code === 'P2025') {
        return false;
      }
      throw new Error(`Erro ao remover equipamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private mapFromPrisma(e: any): EquipmentRecord {
    return {
      id: e.id,
      label: e.label,
      type: e.type,
      serial: e.serial,
      status: e.status,
      providerId: e.providerId,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    };
  }

  async getStatsByProvider(providerId: number): Promise<{ total: number; byType: Record<$Enums.EquipmentType, number>; }> {
    try {
      const total = await this.prisma.equipment.count({ where: { providerId } });
      const groups = await this.prisma.equipment.groupBy({
        by: ['type'],
        where: { providerId },
        _count: { _all: true }
      });
      const byType: Record<$Enums.EquipmentType, number> = {} as Record<$Enums.EquipmentType, number>;
      for (const g of groups as Array<{ type: $Enums.EquipmentType; _count: { _all: number } }>) {
        byType[g.type] = g._count._all;
      }
      return { total, byType };
    } catch (error) {
      console.error('Erro no EquipmentRepository.getStatsByProvider:', error);
      throw new Error(`Erro ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}