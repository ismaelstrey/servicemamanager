"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientServiceOrderController = void 0;
const serviceOrderRepository_1 = require("../repositories/serviceOrderRepository");
const commentRepository_1 = require("../repositories/commentRepository");
const clientValidator_1 = require("../validators/clientValidator");
// Usar strings para valores padrão de enums de OS
const changeHistoryService_1 = require("../services/changeHistoryService");
const paginationHelper_1 = require("../utils/paginationHelper");
const unifiedTimelineService_1 = require("../services/unifiedTimelineService");
const slaService_1 = require("../services/slaService");
class ClientServiceOrderController {
    constructor() {
        this.serviceOrderRepo = new serviceOrderRepository_1.ServiceOrderRepository();
        this.commentRepo = new commentRepository_1.CommentRepository();
        this.historyService = new changeHistoryService_1.ChangeHistoryService();
        this.timelineService = new unifiedTimelineService_1.UnifiedTimelineService();
        this.slaService = new slaService_1.SlaService();
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
            const [itemsRaw, total] = await Promise.all([
                this.serviceOrderRepo.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
                this.serviceOrderRepo.count({ where })
            ]);
            const items = await Promise.all(itemsRaw.map(async (so) => ({
                ...so,
                sla: await this.slaService.computeForServiceOrder(req.customer, req.customer.providerId, {
                    createdAt: so.createdAt,
                    priority: so.priority,
                    status: so.status
                })
            })));
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
            const sla = await this.slaService.computeForServiceOrder(req.customer, req.customer.providerId, {
                createdAt: so.createdAt,
                priority: so.priority,
                status: so.status
            });
            res.json({ success: true, data: { ...so, sla } });
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
                status: 'pending',
                priority: 'medium',
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
    async uploadAttachment(req, res) {
        try {
            if (!req.customer) {
                res.status(401).json({ success: false, message: 'Não autenticado' });
                return;
            }
            const id = Number(req.params.id);
            if (!id || id <= 0) {
                res.status(400).json({ success: false, message: 'ID inválido' });
                return;
            }
            const so = await this.serviceOrderRepo.findById(id);
            if (!so || so.providerId !== req.customer.providerId || so.customerId !== req.customer.id) {
                res.status(404).json({ success: false, message: 'Ordem de serviço não encontrada' });
                return;
            }
            const file = req.file;
            if (!file) {
                res.status(400).json({ success: false, message: 'Arquivo ausente (field: file)' });
                return;
            }
            const allowed = [
                'image/png',
                'image/jpeg',
                'image/gif',
                'image/webp',
                'image/svg+xml',
                'application/pdf',
                'text/plain',
                'application/zip',
                'application/x-zip-compressed',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ];
            if (!allowed.includes(file.mimetype)) {
                res.status(400).json({ success: false, message: 'Tipo de arquivo não suportado' });
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                res.status(400).json({ success: false, message: 'Arquivo excede 10MB' });
                return;
            }
            const { uploadBuffer } = await Promise.resolve().then(() => __importStar(require('../services/storageService')));
            const safeName = (file.originalname || 'arquivo').replace(/[^a-zA-Z0-9_.-]/g, '_');
            const key = `attachments/service-orders/${id}/${Date.now()}_${safeName}`;
            const { url } = await uploadBuffer(key, file.buffer, file.mimetype);
            // Registrar comentário público com link do anexo
            const comment = await this.commentRepo.create({
                content: `Anexo: ${safeName} (${url})`,
                resourceType: 'service_order',
                resourceId: id,
                isInternal: false,
                userId: undefined,
                customerId: req.customer.id,
                providerId: req.customer.providerId
            });
            res.status(201).json({ success: true, data: { url, fileName: safeName, mimeType: file.mimetype, size: file.size, comment } });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao enviar anexo';
            res.status(500).json({ success: false, message });
        }
    }
    /**
     * Histórico de mudanças da OS do cliente
     * GET /api/client/service-orders/:id/history
     */
    async history(req, res) {
        try {
            if (!req.customer) {
                res.status(401).json({ success: false, message: 'Não autenticado' });
                return;
            }
            const id = Number(req.params.id);
            if (!id || id <= 0) {
                res.status(400).json({ success: false, message: 'ID inválido' });
                return;
            }
            const so = await this.serviceOrderRepo.findById(id);
            if (!so || so.providerId !== req.customer.providerId || so.customerId !== req.customer.id) {
                res.status(404).json({ success: false, message: 'Ordem de serviço não encontrada' });
                return;
            }
            const { page, limit } = (0, paginationHelper_1.calculatePagination)({
                page: req.query.page ? parseInt(String(req.query.page)) : undefined,
                limit: req.query.limit ? parseInt(String(req.query.limit)) : undefined,
                maxLimit: 100,
                defaultLimit: 20
            });
            const result = await this.historyService.listByEntity(req.customer.providerId, 'service_order', id, page, limit);
            res.json({
                success: true,
                data: result.history,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit)
                },
                message: 'Histórico obtido com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao obter histórico da OS';
            res.status(500).json({ success: false, message });
        }
    }
    /**
     * Timeline unificada (histórico + comentários públicos) da OS do cliente
     * GET /api/client/service-orders/:id/timeline
     */
    async timeline(req, res) {
        try {
            if (!req.customer) {
                res.status(401).json({ success: false, message: 'Não autenticado' });
                return;
            }
            const id = Number(req.params.id);
            if (!id || id <= 0) {
                res.status(400).json({ success: false, message: 'ID inválido' });
                return;
            }
            const so = await this.serviceOrderRepo.findById(id);
            if (!so || so.providerId !== req.customer.providerId || so.customerId !== req.customer.id) {
                res.status(404).json({ success: false, message: 'Ordem de serviço não encontrada' });
                return;
            }
            const { page, limit } = (0, paginationHelper_1.calculatePagination)({
                page: req.query.page ? parseInt(String(req.query.page)) : undefined,
                limit: req.query.limit ? parseInt(String(req.query.limit)) : undefined,
                maxLimit: 100,
                defaultLimit: 20
            });
            const result = await this.timelineService.listForClient(req.customer.providerId, 'service_order', id, page, limit);
            res.json({
                success: true,
                data: result.items,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                },
                message: 'Timeline obtida com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao obter timeline da OS';
            res.status(500).json({ success: false, message });
        }
    }
}
exports.ClientServiceOrderController = ClientServiceOrderController;
