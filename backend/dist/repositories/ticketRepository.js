"use strict";
// Repositório para acesso aos dados de Tickets
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRepository = void 0;
const client_1 = require("@prisma/client");
const paginationHelper_1 = require("../utils/paginationHelper");
class TicketRepository {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async create(providerId, data) {
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
        }
        catch (error) {
            console.error('Erro no TicketRepository.create:', error);
            throw new Error(`Erro ao criar ticket: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async listByProvider(providerId, query) {
        try {
            const { search, status, priority } = query;
            // Usar helper de paginação otimizada
            const paginationParams = (0, paginationHelper_1.calculatePagination)({
                page: query.page,
                limit: query.limit,
                maxLimit: 100,
                defaultLimit: 10
            });
            const where = { providerId };
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
            if (query.startDate || query.endDate) {
                where.createdAt = {};
                if (query.startDate)
                    where.createdAt.gte = query.startDate;
                if (query.endDate)
                    where.createdAt.lte = query.endDate;
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
            const pagination = (0, paginationHelper_1.createPaginationMeta)(paginationParams.page, paginationParams.limit, total);
            return { tickets, pagination };
        }
        catch (error) {
            console.error('Erro no TicketRepository.listByProvider:', error);
            throw new Error(`Erro ao listar tickets: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async listAll(query) {
        try {
            const { search, status, priority } = query;
            const paginationParams = (0, paginationHelper_1.calculatePagination)({
                page: query.page,
                limit: query.limit,
                maxLimit: 100,
                defaultLimit: 10
            });
            const where = {};
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
            if (query.startDate || query.endDate) {
                where.createdAt = {};
                if (query.startDate)
                    where.createdAt.gte = query.startDate;
                if (query.endDate)
                    where.createdAt.lte = query.endDate;
            }
            const [total, items] = await Promise.all([
                this.prisma.ticket.count({ where }),
                this.prisma.ticket.findMany({
                    where,
                    skip: paginationParams.skip,
                    take: paginationParams.take,
                    orderBy: { createdAt: 'desc' },
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
            const pagination = (0, paginationHelper_1.createPaginationMeta)(paginationParams.page, paginationParams.limit, total);
            return { tickets, pagination };
        }
        catch (error) {
            console.error('Erro no TicketRepository.listAll:', error);
            throw new Error(`Erro ao listar tickets: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async findById(id) {
        try {
            const ticket = await this.prisma.ticket.findUnique({ where: { id } });
            return ticket ? this.mapFromPrisma(ticket) : null;
        }
        catch (error) {
            console.error('Erro no TicketRepository.findById:', error);
            throw new Error(`Erro ao buscar ticket: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async update(id, data) {
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
        }
        catch (error) {
            console.error('Erro no TicketRepository.update:', error);
            if (error.code === 'P2025') {
                return null;
            }
            throw new Error(`Erro ao atualizar ticket: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async updateStatus(id, status) {
        try {
            const ticket = await this.prisma.ticket.update({
                where: { id },
                data: { status, updatedAt: new Date() }
            });
            return ticket ? this.mapFromPrisma(ticket) : null;
        }
        catch (error) {
            console.error('Erro no TicketRepository.updateStatus:', error);
            if (error.code === 'P2025') {
                return null;
            }
            throw new Error(`Erro ao alterar status do ticket: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async delete(id) {
        try {
            await this.prisma.ticket.delete({ where: { id } });
            return true;
        }
        catch (error) {
            console.error('Erro no TicketRepository.delete:', error);
            if (error.code === 'P2025') {
                return false;
            }
            throw new Error(`Erro ao remover ticket: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async getStatsByProvider(providerId) {
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
            };
            for (const g of statusGroups) {
                byStatus[g.status] = g._count._all;
            }
            const byPriority = { low: 0, medium: 0, high: 0, critical: 0 };
            for (const g of priorityGroups) {
                byPriority[g.priority] = g._count._all;
            }
            return { total, byStatus, byPriority };
        }
        catch (error) {
            console.error('Erro no TicketRepository.getStatsByProvider:', error);
            throw new Error(`Erro ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async getKanbanByProvider(providerId, limit) {
        try {
            const items = await this.prisma.ticket.findMany({
                where: { providerId },
                select: { id: true, title: true, priority: true, status: true, updatedAt: true },
                orderBy: { updatedAt: 'desc' }
            });
            const board = {
                open: [],
                in_progress: [],
                waiting_client: [],
                resolved: [],
                closed: []
            };
            for (const t of items) {
                const col = t.status;
                if (!board[col])
                    continue;
                board[col].push({ id: t.id, title: t.title, priority: t.priority, updatedAt: t.updatedAt });
            }
            if (typeof limit === 'number' && limit > 0) {
                for (const col of Object.keys(board)) {
                    board[col] = board[col].slice(0, limit);
                }
            }
            return board;
        }
        catch (error) {
            console.error('Erro no TicketRepository.getKanbanByProvider:', error);
            throw new Error(`Erro ao obter kanban: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async getKanbanAll(limit) {
        try {
            const items = await this.prisma.ticket.findMany({
                select: { id: true, title: true, priority: true, status: true, updatedAt: true },
                orderBy: { updatedAt: 'desc' }
            });
            const board = {
                open: [],
                in_progress: [],
                waiting_client: [],
                resolved: [],
                closed: []
            };
            for (const t of items) {
                const col = t.status;
                if (!board[col])
                    continue;
                board[col].push({ id: t.id, title: t.title, priority: t.priority, updatedAt: t.updatedAt });
            }
            if (typeof limit === 'number' && limit > 0) {
                for (const col of Object.keys(board)) {
                    board[col] = board[col].slice(0, limit);
                }
            }
            return board;
        }
        catch (error) {
            console.error('Erro no TicketRepository.getKanbanAll:', error);
            throw new Error(`Erro ao obter kanban: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    mapFromPrisma(t) {
        return {
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            source: t.source,
            providerId: t.providerId,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
        };
    }
}
exports.TicketRepository = TicketRepository;
