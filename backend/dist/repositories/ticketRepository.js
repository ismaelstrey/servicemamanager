"use strict";
// Repositório para acesso aos dados de Tickets
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRepository = void 0;
const client_1 = require("@prisma/client");
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
            const { page = 1, limit = 10, search, status, priority } = query;
            const skip = (page - 1) * limit;
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
            const total = await this.prisma.ticket.count({ where });
            const items = await this.prisma.ticket.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            });
            const tickets = items.map(this.mapFromPrisma);
            const totalPages = Math.ceil(total / limit);
            const pagination = {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
            return { tickets, pagination };
        }
        catch (error) {
            console.error('Erro no TicketRepository.listByProvider:', error);
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
