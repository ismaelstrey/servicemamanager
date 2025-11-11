"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientServiceOrderService = void 0;
const serviceOrderRepository_1 = require("../repositories/serviceOrderRepository");
const commentRepository_1 = require("../repositories/commentRepository");
class ClientServiceOrderService {
    constructor() {
        this.soRepo = new serviceOrderRepository_1.ServiceOrderRepository();
        this.commentRepo = new commentRepository_1.CommentRepository();
    }
    async list(providerId, customerId, query) {
        const page = query?.page && query.page > 0 ? query.page : 1;
        const limit = query?.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
        const skip = (page - 1) * limit;
        const where = { providerId, customerId };
        if (query?.status)
            where.status = query.status;
        if (query?.priority)
            where.priority = query.priority;
        if (query?.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        const [items, total] = await Promise.all([
            this.soRepo.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
            this.soRepo.count({ where })
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getById(id, providerId, customerId) {
        const so = await this.soRepo.findById(id);
        if (!so || so.providerId !== providerId || so.customerId !== customerId) {
            const err = new Error('Ordem de serviço não encontrada');
            err.status = 404;
            throw err;
        }
        const comments = await this.commentRepo.findByResource('service_order', id, false);
        return { serviceOrder: so, comments };
    }
    async create(providerId, customerId, data) {
        const so = await this.soRepo.create({
            title: data.title,
            description: data.description,
            priority: data.priority || 'medium',
            scheduledDate: data.scheduledDate,
            providerId,
            customerId
        });
        await this.commentRepo.create({
            content: data.description,
            resourceType: 'service_order',
            resourceId: so.id,
            providerId,
            customerId,
            isInternal: false
        });
        return so;
    }
    async comment(serviceOrderId, providerId, customerId, content) {
        const so = await this.soRepo.findById(serviceOrderId);
        if (!so || so.providerId !== providerId || so.customerId !== customerId) {
            const err = new Error('Ordem de serviço não encontrada');
            err.status = 404;
            throw err;
        }
        return this.commentRepo.create({
            content,
            resourceType: 'service_order',
            resourceId: serviceOrderId,
            providerId,
            customerId,
            isInternal: false
        });
    }
    async qualify(serviceOrderId, providerId, customerId, rating, feedback) {
        const so = await this.soRepo.findById(serviceOrderId);
        if (!so || so.providerId !== providerId || so.customerId !== customerId) {
            const err = new Error('Ordem de serviço não encontrada');
            err.status = 404;
            throw err;
        }
        const updated = await this.soRepo.update(serviceOrderId, {
            customerRating: rating,
            customerFeedback: feedback
        });
        return updated;
    }
    async update(serviceOrderId, providerId, customerId, data) {
        const so = await this.soRepo.findById(serviceOrderId);
        if (!so || so.providerId !== providerId || so.customerId !== customerId) {
            const err = new Error('Ordem de serviço não encontrada');
            err.status = 404;
            throw err;
        }
        return this.soRepo.update(serviceOrderId, data);
    }
}
exports.ClientServiceOrderService = ClientServiceOrderService;
