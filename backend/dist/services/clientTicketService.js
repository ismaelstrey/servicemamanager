"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientTicketService = void 0;
const ticketRepository_1 = require("../repositories/ticketRepository");
const commentRepository_1 = require("../repositories/commentRepository");
class ClientTicketService {
    constructor() {
        this.ticketRepo = new ticketRepository_1.TicketRepository();
        this.commentRepo = new commentRepository_1.CommentRepository();
    }
    async list(providerId, customerId, query) {
        // Lista tickets do provedor onde o cliente possui associação via comentários
        return this.ticketRepo.listByProviderAndCustomer(providerId, customerId, query);
    }
    async create(providerId, customerId, data) {
        const ticket = await this.ticketRepo.create(providerId, {
            title: data.title,
            description: data.description,
            priority: data.priority,
            source: data.source || 'api'
        });
        await this.commentRepo.create({
            content: data.description,
            resourceType: 'ticket',
            resourceId: ticket.id,
            providerId,
            customerId,
            isInternal: false
        });
        return ticket;
    }
    async getById(id, providerId, customerId) {
        const ticket = await this.ticketRepo.findById(id);
        if (!ticket || ticket.providerId !== providerId) {
            const err = new Error('Ticket não encontrado');
            err.status = 404;
            throw err;
        }
        const association = await this.commentRepo.findMany({
            resourceType: 'ticket',
            resourceId: id,
            providerId,
            customerId,
            page: 1,
            limit: 1
        });
        if (!association || association.total === 0) {
            const err = new Error('Você não possui acesso a este ticket');
            err.status = 403;
            throw err;
        }
        const comments = await this.commentRepo.findByResource('ticket', id, false);
        return { ticket, comments };
    }
    async comment(ticketId, providerId, customerId, content) {
        const ticket = await this.ticketRepo.findById(ticketId);
        if (!ticket || ticket.providerId !== providerId) {
            const err = new Error('Ticket não encontrado');
            err.status = 404;
            throw err;
        }
        const association = await this.commentRepo.findMany({
            resourceType: 'ticket',
            resourceId: ticketId,
            providerId,
            customerId,
            page: 1,
            limit: 1
        });
        if (!association || association.total === 0) {
            const err = new Error('Você não possui acesso a este ticket');
            err.status = 403;
            throw err;
        }
        return this.commentRepo.create({
            content,
            resourceType: 'ticket',
            resourceId: ticketId,
            providerId,
            customerId,
            isInternal: false
        });
    }
}
exports.ClientTicketService = ClientTicketService;
