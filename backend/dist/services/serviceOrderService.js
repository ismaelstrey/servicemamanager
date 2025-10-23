"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceOrderService = void 0;
const serviceOrderRepository_1 = require("../repositories/serviceOrderRepository");
const providerService_1 = require("./providerService");
const client_1 = require("@prisma/client");
class ServiceOrderService {
    constructor() {
        this.serviceOrderRepository = new serviceOrderRepository_1.ServiceOrderRepository();
        this.providerService = new providerService_1.ProviderService();
    }
    async getServiceOrders(user, page = 1, limit = 10, filters = {}) {
        // Validate provider access
        if (filters.providerId) {
            await this.providerService.findById(filters.providerId, user);
        }
        const offset = (page - 1) * limit;
        const whereClause = {};
        // Apply filters
        if (filters.status) {
            whereClause.status = filters.status;
        }
        if (filters.priority) {
            whereClause.priority = filters.priority;
        }
        if (filters.providerId) {
            whereClause.providerId = filters.providerId;
        }
        else if (user.role !== 'admin' && user.providerId) {
            // Non-admin users can only see service orders from their provider
            whereClause.providerId = user.providerId;
        }
        const [serviceOrders, total] = await Promise.all([
            this.serviceOrderRepository.findMany({
                where: whereClause,
                skip: offset,
                take: limit,
                include: {
                    provider: true,
                    ticket: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.serviceOrderRepository.count({ where: whereClause })
        ]);
        return {
            data: serviceOrders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getServiceOrderById(user, id) {
        const serviceOrder = await this.serviceOrderRepository.findById(id, {
            include: {
                provider: true,
                ticket: true
            }
        });
        if (!serviceOrder) {
            return null;
        }
        // Validate access
        await this.providerService.findById(serviceOrder.providerId, user);
        return serviceOrder;
    }
    async createServiceOrder(user, data) {
        // Validate provider access
        await this.providerService.findById(data.providerId, user);
        // Validate ticket access if provided
        if (data.ticketId) {
            // TODO: Add ticket validation when ticket service is available
        }
        const serviceOrderData = {
            title: data.title,
            description: data.description,
            status: data.status || client_1.ServiceOrderStatus.pending,
            priority: data.priority || client_1.ServiceOrderPriority.medium,
            scheduledDate: data.scheduledDate,
            estimatedHours: data.estimatedHours,
            cost: data.cost,
            notes: data.notes,
            provider: {
                connect: { id: data.providerId }
            },
            ticket: data.ticketId ? {
                connect: { id: data.ticketId }
            } : undefined
        };
        return await this.serviceOrderRepository.create(serviceOrderData);
    }
    async updateServiceOrder(user, id, data) {
        const existingServiceOrder = await this.getServiceOrderById(user, id);
        if (!existingServiceOrder) {
            return null;
        }
        // Auto-set timestamps based on status changes
        const updateData = { ...data };
        if (data.status) {
            if (data.status === client_1.ServiceOrderStatus.in_progress && !existingServiceOrder.startedAt) {
                updateData.startedAt = new Date();
            }
            else if (data.status === client_1.ServiceOrderStatus.completed && !existingServiceOrder.completedAt) {
                updateData.completedAt = new Date();
            }
        }
        return await this.serviceOrderRepository.update(id, updateData);
    }
    async deleteServiceOrder(user, id) {
        const serviceOrder = await this.getServiceOrderById(user, id);
        if (!serviceOrder) {
            return false;
        }
        await this.serviceOrderRepository.delete(id);
        return true;
    }
    async updateServiceOrderStatus(user, id, status) {
        return await this.updateServiceOrder(user, id, { status });
    }
    async getServiceOrderStats(user, providerId) {
        let whereClause = {};
        if (providerId) {
            await this.providerService.findById(providerId, user);
            whereClause.providerId = providerId;
        }
        else if (user.role !== 'admin' && user.providerId) {
            whereClause.providerId = user.providerId;
        }
        const [total, statusResults, priorityResults, completedOrders, revenueData] = await Promise.all([
            this.serviceOrderRepository.count({ where: whereClause }),
            this.serviceOrderRepository.groupBy({
                by: ['status'],
                where: whereClause,
                _count: true
            }),
            this.serviceOrderRepository.groupBy({
                by: ['priority'],
                where: whereClause,
                _count: true
            }),
            this.serviceOrderRepository.findMany({
                where: {
                    ...whereClause,
                    status: client_1.ServiceOrderStatus.completed,
                    startedAt: { not: null },
                    completedAt: { not: null }
                }
            }),
            this.serviceOrderRepository.aggregate({
                where: whereClause,
                _sum: {
                    cost: true
                }
            })
        ]);
        // Convert grouped results to counts
        const statusCounts = {};
        statusResults.forEach((item) => {
            statusCounts[item.status] = item._count;
        });
        const priorityCounts = {};
        priorityResults.forEach((item) => {
            priorityCounts[item.priority] = item._count;
        });
        // Calculate average completion time
        let averageCompletionTime = 0;
        if (completedOrders.length > 0) {
            const totalTime = completedOrders.reduce((sum, order) => {
                if (order.startedAt && order.completedAt) {
                    return sum + (order.completedAt.getTime() - order.startedAt.getTime());
                }
                return sum;
            }, 0);
            averageCompletionTime = totalTime / completedOrders.length / (1000 * 60 * 60); // Convert to hours
        }
        // Build status counts
        const byStatus = Object.values(client_1.ServiceOrderStatus).reduce((acc, status) => {
            acc[status] = 0;
            return acc;
        }, {});
        Object.keys(statusCounts).forEach((status) => {
            byStatus[status] = statusCounts[status];
        });
        // Build priority counts
        const byPriority = Object.values(client_1.ServiceOrderPriority).reduce((acc, priority) => {
            acc[priority] = 0;
            return acc;
        }, {});
        Object.keys(priorityCounts).forEach((priority) => {
            byPriority[priority] = priorityCounts[priority];
        });
        // Calculate pending revenue
        const pendingRevenue = await this.serviceOrderRepository.aggregate({
            where: {
                ...whereClause,
                status: {
                    in: [client_1.ServiceOrderStatus.pending, client_1.ServiceOrderStatus.in_progress]
                }
            },
            _sum: {
                cost: true
            }
        });
        return {
            total,
            byStatus,
            byPriority,
            averageCompletionTime,
            totalRevenue: revenueData._sum.cost || 0,
            pendingRevenue: pendingRevenue._sum.cost || 0
        };
    }
}
exports.ServiceOrderService = ServiceOrderService;
