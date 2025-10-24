"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientTicketController = void 0;
const client_1 = require("@prisma/client");
const ticketRepository_1 = require("../repositories/ticketRepository");
const commentRepository_1 = require("../repositories/commentRepository");
const clientValidator_1 = require("../validators/clientValidator");
const prisma = new client_1.PrismaClient();
class ClientTicketController {
    constructor() {
        this.ticketRepo = new ticketRepository_1.TicketRepository();
        this.commentRepo = new commentRepository_1.CommentRepository();
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
            const [tickets, total] = await Promise.all([
                prisma.ticket.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.ticket.count({ where })
            ]);
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
            res.json({ success: true, data: { ticket, comments } });
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
}
exports.ClientTicketController = ClientTicketController;
