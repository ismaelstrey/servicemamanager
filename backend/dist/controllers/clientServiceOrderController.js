"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientServiceOrderController = void 0;
const serviceOrderRepository_1 = require("../repositories/serviceOrderRepository");
const commentRepository_1 = require("../repositories/commentRepository");
const clientValidator_1 = require("../validators/clientValidator");
const client_1 = require("@prisma/client");
class ClientServiceOrderController {
    constructor() {
        this.serviceOrderRepo = new serviceOrderRepository_1.ServiceOrderRepository();
        this.commentRepo = new commentRepository_1.CommentRepository();
    }
    async list(req, res) {
        try {
            if (!req.customer) {
                res.status(401).json({ message: 'Não autenticado' });
                return;
            }
            const parsed = clientValidator_1.clientListServiceOrdersSchema.safeParse(req.query);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }
            const { page, limit, status } = parsed.data;
            const where = {
                providerId: req.customer.providerId,
                customerId: req.customer.id
            };
            if (status)
                where.status = status;
            const skip = (page - 1) * limit;
            const [items, total] = await Promise.all([
                this.serviceOrderRepo.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
                this.serviceOrderRepo.count({ where })
            ]);
            res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao listar ordens de serviço';
            res.status(500).json({ success: false, message });
        }
    }
    async getById(req, res) {
        try {
            if (!req.customer) {
                res.status(401).json({ message: 'Não autenticado' });
                return;
            }
            const id = Number(req.params.id);
            if (!id || id <= 0) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const so = await this.serviceOrderRepo.findById(id);
            if (!so || so.providerId !== req.customer.providerId || so.customerId !== req.customer.id) {
                res.status(404).json({ message: 'Ordem de serviço não encontrada' });
                return;
            }
            res.json({ success: true, data: so });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao obter ordem de serviço';
            res.status(500).json({ success: false, message });
        }
    }
    async create(req, res) {
        try {
            if (!req.customer) {
                res.status(401).json({ message: 'Não autenticado' });
                return;
            }
            const parsed = clientValidator_1.clientCreateServiceOrderSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }
            const data = parsed.data;
            const created = await this.serviceOrderRepo.create({
                title: data.title,
                description: data.description,
                status: client_1.ServiceOrderStatus.pending,
                priority: client_1.ServiceOrderPriority.medium,
                scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
                estimatedHours: data.estimatedHours,
                notes: data.notes,
                provider: { connect: { id: req.customer.providerId } },
                customer: { connect: { id: req.customer.id } }
            });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar ordem de serviço';
            res.status(500).json({ success: false, message });
        }
    }
    async comment(req, res) {
        try {
            if (!req.customer) {
                res.status(401).json({ message: 'Não autenticado' });
                return;
            }
            const id = Number(req.params.id);
            if (!id || id <= 0) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const so = await this.serviceOrderRepo.findById(id);
            if (!so || so.providerId !== req.customer.providerId || so.customerId !== req.customer.id) {
                res.status(404).json({ message: 'Ordem de serviço não encontrada' });
                return;
            }
            const parsed = clientValidator_1.clientCommentSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }
            const created = await this.commentRepo.create({
                content: parsed.data.content,
                resourceType: 'service_order',
                resourceId: id,
                isInternal: false,
                userId: undefined,
                customerId: req.customer.id,
                providerId: req.customer.providerId,
            });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao comentar na OS';
            res.status(500).json({ success: false, message });
        }
    }
    async qualify(req, res) {
        try {
            if (!req.customer) {
                res.status(401).json({ message: 'Não autenticado' });
                return;
            }
            const id = Number(req.params.id);
            if (!id || id <= 0) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const so = await this.serviceOrderRepo.findById(id);
            if (!so || so.providerId !== req.customer.providerId || so.customerId !== req.customer.id) {
                res.status(404).json({ message: 'Ordem de serviço não encontrada' });
                return;
            }
            const parsed = clientValidator_1.clientQualificationSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }
            const updated = await this.serviceOrderRepo.update(id, {
                customerRating: parsed.data.rating,
                customerFeedback: parsed.data.feedback
            });
            res.json({ success: true, data: updated });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao qualificar OS';
            res.status(500).json({ success: false, message });
        }
    }
    async update(req, res) {
        try {
            if (!req.customer) {
                res.status(401).json({ message: 'Não autenticado' });
                return;
            }
            const id = Number(req.params.id);
            if (!id || id <= 0) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const so = await this.serviceOrderRepo.findById(id);
            if (!so || so.providerId !== req.customer.providerId || so.customerId !== req.customer.id) {
                res.status(404).json({ message: 'Ordem de serviço não encontrada' });
                return;
            }
            const parsed = clientValidator_1.clientUpdateServiceOrderSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }
            const payload = {};
            if (parsed.data.title !== undefined)
                payload.title = parsed.data.title;
            if (parsed.data.description !== undefined)
                payload.description = parsed.data.description;
            if (parsed.data.scheduledDate !== undefined)
                payload.scheduledDate = new Date(parsed.data.scheduledDate);
            if (parsed.data.estimatedHours !== undefined)
                payload.estimatedHours = parsed.data.estimatedHours;
            if (parsed.data.notes !== undefined)
                payload.notes = parsed.data.notes;
            const updated = await this.serviceOrderRepo.update(id, payload);
            res.json({ success: true, data: updated });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao atualizar OS';
            res.status(500).json({ success: false, message });
        }
    }
}
exports.ClientServiceOrderController = ClientServiceOrderController;
