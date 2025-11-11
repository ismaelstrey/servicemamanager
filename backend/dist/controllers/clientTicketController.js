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
exports.ClientTicketController = void 0;
const prisma_1 = require("../lib/prisma");
const ticketRepository_1 = require("../repositories/ticketRepository");
const commentRepository_1 = require("../repositories/commentRepository");
const clientValidator_1 = require("../validators/clientValidator");
const changeHistoryService_1 = require("../services/changeHistoryService");
const paginationHelper_1 = require("../utils/paginationHelper");
const unifiedTimelineService_1 = require("../services/unifiedTimelineService");
const slaService_1 = require("../services/slaService");
// use shared prisma instance
class ClientTicketController {
    constructor() {
        this.ticketRepo = new ticketRepository_1.TicketRepository();
        this.commentRepo = new commentRepository_1.CommentRepository();
        this.historyService = new changeHistoryService_1.ChangeHistoryService();
        this.timelineService = new unifiedTimelineService_1.UnifiedTimelineService();
        this.slaService = new slaService_1.SlaService();
    }
    async list(req, res) {
        try {
            if (!req.customer) {
                res.status(401).json({ success: false, message: 'Não autenticado' });
                return;
            }
            const parsed = clientValidator_1.clientListTicketsSchema.safeParse(req.query);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }
            const { page, limit, status, search, priority } = parsed.data;
            const where = {
                providerId: req.customer.providerId,
                comments: { some: { customerId: req.customer.id } }
            };
            if (status)
                where.status = status;
            if (priority)
                where.priority = priority;
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }
            const skip = (page - 1) * limit;
            const [ticketsRaw, total] = await Promise.all([
                prisma_1.prisma.ticket.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma_1.prisma.ticket.count({ where })
            ]);
            // Calcular SLA por item
            const tickets = await Promise.all(ticketsRaw.map(async (t) => ({
                ...t,
                sla: await this.slaService.computeForTicket(req.customer, req.customer.providerId, {
                    createdAt: t.createdAt,
                    priority: t.priority,
                    status: t.status
                })
            })));
            res.json({
                success: true,
                data: tickets,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao listar tickets do cliente';
            res.status(500).json({ success: false, message });
        }
    }
    async create(req, res) {
        try {
            if (!req.customer) {
                res.status(401).json({ success: false, message: 'Não autenticado' });
                return;
            }
            const parsed = clientValidator_1.clientCreateTicketSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }
            const { title, description, priority } = parsed.data;
            // Cria o ticket vinculado ao provedor do cliente
            const ticket = await this.ticketRepo.create(req.customer.providerId, {
                title,
                description,
                priority,
                source: 'api'
            });
            // Cria um comentário do cliente para associá-lo ao ticket
            await this.commentRepo.create({
                content: description,
                resourceType: 'ticket',
                resourceId: ticket.id,
                providerId: req.customer.providerId,
                customerId: req.customer.id,
                isInternal: false
            });
            res.status(201).json({ success: true, data: ticket });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar ticket do cliente';
            res.status(500).json({ success: false, message });
        }
    }
    async getById(req, res) {
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
            const ticket = await this.ticketRepo.findById(id);
            if (!ticket || ticket.providerId !== req.customer.providerId) {
                res.status(404).json({ success: false, message: 'Ticket não encontrado' });
                return;
            }
            // Verificar associação do cliente ao ticket via comentários
            const association = await this.commentRepo.findMany({
                resourceType: 'ticket',
                resourceId: id,
                providerId: req.customer.providerId,
                customerId: req.customer.id,
                page: 1,
                limit: 1
            });
            if (!association || association.total === 0) {
                res.status(403).json({ success: false, message: 'Você não possui acesso a este ticket' });
                return;
            }
            const comments = await this.commentRepo.findByResource('ticket', id, false);
            const sla = await this.slaService.computeForTicket(req.customer, req.customer.providerId, {
                createdAt: ticket.createdAt,
                priority: ticket.priority,
                status: ticket.status
            });
            res.json({ success: true, data: { ticket, comments, sla } });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao buscar ticket do cliente';
            res.status(500).json({ success: false, message });
        }
    }
    async comment(req, res) {
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
            const ticket = await this.ticketRepo.findById(id);
            if (!ticket || ticket.providerId !== req.customer.providerId) {
                res.status(404).json({ success: false, message: 'Ticket não encontrado' });
                return;
            }
            // Garantir que o cliente esteja associado ao ticket via comentários anteriores
            const association = await this.commentRepo.findMany({
                resourceType: 'ticket',
                resourceId: id,
                providerId: req.customer.providerId,
                customerId: req.customer.id,
                page: 1,
                limit: 1
            });
            if (!association || association.total === 0) {
                res.status(403).json({ success: false, message: 'Você não possui acesso a este ticket' });
                return;
            }
            const parsed = clientValidator_1.clientCommentSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }
            const created = await this.commentRepo.create({
                content: parsed.data.content,
                resourceType: 'ticket',
                resourceId: id,
                isInternal: false,
                userId: undefined,
                customerId: req.customer.id,
                providerId: req.customer.providerId,
            });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao comentar no ticket';
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
            const ticket = await this.ticketRepo.findById(id);
            if (!ticket || ticket.providerId !== req.customer.providerId) {
                res.status(404).json({ success: false, message: 'Ticket não encontrado' });
                return;
            }
            // Garantir associação do cliente ao ticket via comentários anteriores
            const association = await this.commentRepo.findMany({
                resourceType: 'ticket',
                resourceId: id,
                providerId: req.customer.providerId,
                customerId: req.customer.id,
                page: 1,
                limit: 1
            });
            if (!association || association.total === 0) {
                res.status(403).json({ success: false, message: 'Você não possui acesso a este ticket' });
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
            const key = `attachments/tickets/${id}/${Date.now()}_${safeName}`;
            const { url } = await uploadBuffer(key, file.buffer, file.mimetype);
            // Registrar comentário público com link do anexo
            const comment = await this.commentRepo.create({
                content: `Anexo: ${safeName} (${url})`,
                resourceType: 'ticket',
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
     * Histórico de mudanças do ticket do cliente
     * GET /api/client/tickets/:id/history
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
            const ticket = await this.ticketRepo.findById(id);
            if (!ticket || ticket.providerId !== req.customer.providerId) {
                res.status(404).json({ success: false, message: 'Ticket não encontrado' });
                return;
            }
            // Verificar associação do cliente ao ticket via comentários
            const association = await this.commentRepo.findMany({
                resourceType: 'ticket',
                resourceId: id,
                providerId: req.customer.providerId,
                customerId: req.customer.id,
                page: 1,
                limit: 1
            });
            if (!association || association.total === 0) {
                res.status(403).json({ success: false, message: 'Você não possui acesso a este ticket' });
                return;
            }
            const { page, limit } = (0, paginationHelper_1.calculatePagination)({
                page: req.query.page ? parseInt(String(req.query.page)) : undefined,
                limit: req.query.limit ? parseInt(String(req.query.limit)) : undefined,
                maxLimit: 100,
                defaultLimit: 20
            });
            const result = await this.historyService.listByEntity(req.customer.providerId, 'ticket', id, page, limit);
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
            const message = error instanceof Error ? error.message : 'Erro ao obter histórico do ticket';
            res.status(500).json({ success: false, message });
        }
    }
    /**
     * Timeline unificada (histórico + comentários públicos) do ticket do cliente
     * GET /api/client/tickets/:id/timeline
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
            const ticket = await this.ticketRepo.findById(id);
            if (!ticket || ticket.providerId !== req.customer.providerId) {
                res.status(404).json({ success: false, message: 'Ticket não encontrado' });
                return;
            }
            // Verificar associação do cliente ao ticket via comentários (acesso ao recurso)
            const association = await this.commentRepo.findMany({
                resourceType: 'ticket',
                resourceId: id,
                providerId: req.customer.providerId,
                customerId: req.customer.id,
                page: 1,
                limit: 1
            });
            if (!association || association.total === 0) {
                res.status(403).json({ success: false, message: 'Você não possui acesso a este ticket' });
                return;
            }
            const { page, limit } = (0, paginationHelper_1.calculatePagination)({
                page: req.query.page ? parseInt(String(req.query.page)) : undefined,
                limit: req.query.limit ? parseInt(String(req.query.limit)) : undefined,
                maxLimit: 100,
                defaultLimit: 20
            });
            const result = await this.timelineService.listForClient(req.customer.providerId, 'ticket', id, page, limit);
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
            const message = error instanceof Error ? error.message : 'Erro ao obter timeline do ticket';
            res.status(500).json({ success: false, message });
        }
    }
}
exports.ClientTicketController = ClientTicketController;
