"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceOrderRepository = void 0;
const client_1 = require("@prisma/client");
class ServiceOrderRepository {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async findMany(params) {
        return await this.prisma.serviceOrder.findMany(params);
    }
    async findById(id, params) {
        return await this.prisma.serviceOrder.findUnique({
            where: { id },
            ...params
        });
    }
    async create(data) {
        return await this.prisma.serviceOrder.create({
            data,
            include: {
                provider: true,
                ticket: true
            }
        });
    }
    async update(id, data) {
        return await this.prisma.serviceOrder.update({
            where: { id },
            data,
            include: {
                provider: true,
                ticket: true
            }
        });
    }
    async delete(id) {
        return await this.prisma.serviceOrder.delete({
            where: { id }
        });
    }
    async count(params) {
        return await this.prisma.serviceOrder.count(params);
    }
    async groupBy(params) {
        return await this.prisma.serviceOrder.groupBy(params);
    }
    async aggregate(params) {
        return await this.prisma.serviceOrder.aggregate(params);
    }
    async findByProvider(providerId, params) {
        return await this.prisma.serviceOrder.findMany({
            where: { providerId },
            ...params
        });
    }
    async findByTicket(ticketId, params) {
        return await this.prisma.serviceOrder.findMany({
            where: { ticketId },
            ...params
        });
    }
    async findByStatus(status, params) {
        return await this.prisma.serviceOrder.findMany({
            where: { status: status },
            ...params
        });
    }
    async findByDateRange(startDate, endDate, params) {
        return await this.prisma.serviceOrder.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            ...params
        });
    }
    async getKanbanByProvider(providerId) {
        const items = await this.prisma.serviceOrder.findMany({
            where: { providerId },
            select: { id: true, title: true, priority: true, status: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' }
        });
        const board = {
            pending: [],
            in_progress: [],
            waiting_parts: [],
            waiting_client: [],
            completed: [],
            cancelled: []
        };
        for (const so of items) {
            const col = so.status;
            if (!board[col])
                continue;
            board[col].push({ id: so.id, title: so.title, priority: so.priority, updatedAt: so.updatedAt });
        }
        return board;
    }
}
exports.ServiceOrderRepository = ServiceOrderRepository;
