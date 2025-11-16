"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const providerService_1 = require("./providerService");
const ticketRepository_1 = require("../repositories/ticketRepository");
const notificationService_1 = require("./notificationService");
const changeHistoryService_1 = require("./changeHistoryService");
const auditLogger_1 = require("../utils/auditLogger");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
class TicketService {
    constructor() {
        this.repository = new ticketRepository_1.TicketRepository();
        this.providerService = new providerService_1.ProviderService();
        this.notificationService = new notificationService_1.NotificationService();
        this.changeHistoryService = new changeHistoryService_1.ChangeHistoryService();
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
    async listAll(query, user) {
        // Somente administradores podem listar globalmente sem provider
        if (user.role !== 'super_admin' && user.role !== 'admin') {
            const err = new Error('Acesso negado: requer perfil admin/super_admin');
            err.status = 403;
            throw err;
        }
        return this.repository.listAll(query);
    }
    async create(providerId, data, user) {
        await this.assertAccess(user, providerId);
        return this.repository.create(providerId, data, user.id);
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
    async getByIdWithProvider(id, user) {
        const result = await this.repository.findByIdWithProvider(id);
        if (!result) {
            const err = new Error('Ticket não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, result.ticket.providerId);
        return result;
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
        // Histórico de alterações e notificação se houve mudança de status
        if (typeof data.status !== 'undefined' && data.status !== existing.status) {
            await this.changeHistoryService.recordStatusChange('ticket', {
                entityId: id,
                providerId: existing.providerId,
                changedById: user.id,
                from: existing.status,
                to: data.status,
                metadata: { title: updated.title }
            });
            await this.notificationService.createStatusChangeNotification({
                entityType: 'ticket',
                entityId: id,
                providerId: existing.providerId,
                statusFrom: existing.status,
                statusTo: data.status,
                actorName: user.name,
                title: `Ticket #${id} atualizado`
            });
            (0, auditLogger_1.logTicketAudit)('status_change', String(user.id), user.email, String(id), String(existing.providerId), true, undefined, undefined, undefined, { from: existing.status, to: data.status });
            await (0, cacheMiddleware_1.invalidateProviderCache)(String(existing.providerId));
            await (0, cacheMiddleware_1.invalidateResourceCache)('ticket', String(id));
            await (0, cacheMiddleware_1.invalidateResourceCache)('stats');
            // Garantir que boards de Kanban sejam atualizados imediatamente
            await (0, cacheMiddleware_1.invalidateResourceCache)('kanban');
            await (0, cacheMiddleware_1.invalidateResourceCache)('kanban_all');
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
        if (existing.status !== status) {
            await this.changeHistoryService.recordStatusChange('ticket', {
                entityId: id,
                providerId: existing.providerId,
                changedById: user.id,
                from: existing.status,
                to: status,
                metadata: { title: updated.title }
            });
            await this.notificationService.createStatusChangeNotification({
                entityType: 'ticket',
                entityId: id,
                providerId: existing.providerId,
                statusFrom: existing.status,
                statusTo: status,
                actorName: user.name,
                title: `Status do Ticket #${id} atualizado`
            });
            (0, auditLogger_1.logTicketAudit)('status_change', String(user.id), user.email, String(id), String(existing.providerId), true, undefined, undefined, undefined, { from: existing.status, to: status });
            await (0, cacheMiddleware_1.invalidateProviderCache)(String(existing.providerId));
            await (0, cacheMiddleware_1.invalidateResourceCache)('ticket', String(id));
            await (0, cacheMiddleware_1.invalidateResourceCache)('stats');
            // Garantir que boards de Kanban sejam atualizados imediatamente
            await (0, cacheMiddleware_1.invalidateResourceCache)('kanban');
            await (0, cacheMiddleware_1.invalidateResourceCache)('kanban_all');
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
    async getKanban(providerId, user, limit) {
        await this.assertAccess(user, providerId);
        return this.repository.getKanbanByProvider(providerId, limit);
    }
    async getKanbanAll(user, limit) {
        // Dependendo da política de acesso, poderia filtrar por providers acessíveis ao usuário.
        // Por ora, retornamos todos os tickets disponíveis.
        return this.repository.getKanbanAll(limit);
    }
    // New: list change history for a ticket
    async getHistory(id, user, page, limit) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            const err = new Error('Ticket não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, existing.providerId);
        return await this.changeHistoryService.listByEntity(existing.providerId, 'ticket', id, page, limit);
    }
}
exports.TicketService = TicketService;
