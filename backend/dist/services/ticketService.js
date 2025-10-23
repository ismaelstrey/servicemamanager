"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const providerService_1 = require("./providerService");
const ticketRepository_1 = require("../repositories/ticketRepository");
class TicketService {
    constructor() {
        this.repository = new ticketRepository_1.TicketRepository();
        this.providerService = new providerService_1.ProviderService();
    }
    async assertAccess(user, providerId) {
        if (user.role === 'super_admin' || user.role === 'admin')
            return;
        const allowed = await this.providerService.userHasAccess(user.id, providerId);
        if (!allowed) {
            const err = new Error('Acesso negado: usuário não possui acesso a este provedor');
            err.status = 403;
            throw err;
        }
    }
    async list(providerId, query, user) {
        await this.assertAccess(user, providerId);
        return this.repository.listByProvider(providerId, query);
    }
    async create(providerId, data, user) {
        await this.assertAccess(user, providerId);
        return this.repository.create(providerId, data);
    }
    async getById(id, user) {
        const ticket = await this.repository.findById(id);
        if (!ticket) {
            const err = new Error('Ticket não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, ticket.providerId);
        return ticket;
    }
    async update(id, data, user) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            const err = new Error('Ticket não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, existing.providerId);
        const updated = await this.repository.update(id, data);
        if (!updated) {
            const err = new Error('Falha ao atualizar ticket');
            err.status = 500;
            throw err;
        }
        return updated;
    }
    async updateStatus(id, status, user) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            const err = new Error('Ticket não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, existing.providerId);
        const updated = await this.repository.updateStatus(id, status);
        if (!updated) {
            const err = new Error('Falha ao alterar status do ticket');
            err.status = 500;
            throw err;
        }
        return updated;
    }
    async delete(id, user) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            const err = new Error('Ticket não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, existing.providerId);
        const ok = await this.repository.delete(id);
        if (!ok) {
            const err = new Error('Falha ao remover ticket');
            err.status = 500;
            throw err;
        }
        return true;
    }
    async getStats(providerId, user) {
        await this.assertAccess(user, providerId);
        return this.repository.getStatsByProvider(providerId);
    }
}
exports.TicketService = TicketService;
