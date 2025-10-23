// Repositório para acesso aos dados de Tickets

import { PrismaClient } from '@prisma/client';
import { PaginationMeta } from '../types/common.types';
import { calculatePagination, createPaginationMeta } from '../utils/paginationHelper';

export type TicketStatus = 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketSource = 'manual' | 'zabbix' | 'api';

export interface CreateTicketData {
  title: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  source?: TicketSource;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  source?: TicketSource;
}

export interface ListTicketsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface TicketRecord {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  source: TicketSource;
  providerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
}

export class TicketRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(providerId: number, data: CreateTicketData): Promise<TicketRecord> {
    try {
      const ticket = await this.prisma.ticket.create({
        data: {
          providerId,
          title: data.title,
          description: data.description,
          status: data.status ?? 'open',
          priority: data.priority ?? 'medium',
          source: data.source ?? 'manual'
        }
      });
      return this.mapFromPrisma(ticket);
    } catch (error) {
      console.error('Erro no TicketRepository.create:', error);
      throw new Error(`Erro ao criar ticket: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async listByProvider(providerId: number, query: ListTicketsQuery): Promise<{ tickets: TicketRecord[]; pagination: PaginationMeta; }> {
    try {
      const { search, status, priority } = query;
      
      // Usar helper de paginação otimizada
      const paginationParams = calculatePagination({
        page: query.page,
        limit: query.limit,
        maxLimit: 100,
        defaultLimit: 10
      });

      const where: any = { providerId };
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (status) {
        where.status = { equals: status };
      }
      if (priority) {
        where.priority = { equals: priority };
      }

      // Executar count e findMany em paralelo para melhor performance
      const [total, items] = await Promise.all([
        this.prisma.ticket.count({ where }),
        this.prisma.ticket.findMany({
          where,
          skip: paginationParams.skip,
          take: paginationParams.take,
          orderBy: { createdAt: 'desc' },
          // Selecionar apenas campos necessários para otimização
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            source: true,
            providerId: true,
            createdAt: true,
            updatedAt: true
          }
        })
      ]);

      const tickets = items.map(this.mapFromPrisma);
      const pagination = createPaginationMeta(
        paginationParams.page,
        paginationParams.limit,
        total
      );

      return { tickets, pagination };
    } catch (error) {
      console.error('Erro no TicketRepository.listByProvider:', error);
      throw new Error(`Erro ao listar tickets: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async findById(id: number): Promise<TicketRecord | null> {
    try {
      const ticket = await this.prisma.ticket.findUnique({ where: { id } });
      return ticket ? this.mapFromPrisma(ticket) : null;
    } catch (error) {
      console.error('Erro no TicketRepository.findById:', error);
      throw new Error(`Erro ao buscar ticket: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async update(id: number, data: UpdateTicketData): Promise<TicketRecord | null> {
    try {
      const ticket = await this.prisma.ticket.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          source: data.source,
          updatedAt: new Date()
        }
      });
      return ticket ? this.mapFromPrisma(ticket) : null;
    } catch (error: any) {
      console.error('Erro no TicketRepository.update:', error);
      if (error.code === 'P2025') {
        return null;
      }
      throw new Error(`Erro ao atualizar ticket: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async updateStatus(id: number, status: TicketStatus): Promise<TicketRecord | null> {
    try {
      const ticket = await this.prisma.ticket.update({
        where: { id },
        data: { status, updatedAt: new Date() }
      });
      return ticket ? this.mapFromPrisma(ticket) : null;
    } catch (error: any) {
      console.error('Erro no TicketRepository.updateStatus:', error);
      if (error.code === 'P2025') {
        return null;
      }
      throw new Error(`Erro ao alterar status do ticket: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.ticket.delete({ where: { id } });
      return true;
    } catch (error: any) {
      console.error('Erro no TicketRepository.delete:', error);
      if (error.code === 'P2025') {
        return false;
      }
      throw new Error(`Erro ao remover ticket: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getStatsByProvider(providerId: number): Promise<TicketStats> {
    try {
      const total = await this.prisma.ticket.count({ where: { providerId } });
      const statusGroups = await this.prisma.ticket.groupBy({
        by: ['status'],
        where: { providerId },
        _count: { _all: true }
      });
      const priorityGroups = await this.prisma.ticket.groupBy({
        by: ['priority'],
        where: { providerId },
        _count: { _all: true }
      });

      const byStatus = {
        open: 0,
        in_progress: 0,
        waiting_client: 0,
        resolved: 0,
        closed: 0
      } as Record<TicketStatus, number>;

      for (const g of statusGroups as Array<{ status: TicketStatus; _count: { _all: number } }>) {
        byStatus[g.status] = g._count._all;
      }

      const byPriority = { low: 0, medium: 0, high: 0, critical: 0 } as Record<TicketPriority, number>;
      for (const g of priorityGroups as Array<{ priority: TicketPriority; _count: { _all: number } }>) {
        byPriority[g.priority] = g._count._all;
      }

      return { total, byStatus, byPriority };
    } catch (error) {
      console.error('Erro no TicketRepository.getStatsByProvider:', error);
      throw new Error(`Erro ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private mapFromPrisma(t: any): TicketRecord {
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status as TicketStatus,
      priority: t.priority as TicketPriority,
      source: t.source as TicketSource,
      providerId: t.providerId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    };
  }
}