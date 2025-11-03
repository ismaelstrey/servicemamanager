"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const ticketService_1 = require("../services/ticketService");
const paginationHelper_1 = require("../utils/paginationHelper");
class TicketController {
    constructor() {
        this.ticketService = new ticketService_1.TicketService();
    }
    /**
     * Listar tickets de um provedor
     * GET /api/providers/:providerId/tickets
     */
    async list(req, res) {
        try {
            const providerId = parseInt(req.params.providerId);
            if (isNaN(providerId)) {
                res.status(400).json({ success: false, message: 'providerId inválido' });
                return;
            }
            // Usar helper de paginação otimizada
            const paginationParams = (0, paginationHelper_1.calculatePagination)({
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                maxLimit: 100,
                defaultLimit: 10
            });
            const startDateStr = req.query.startDate || undefined;
            const endDateStr = req.query.endDate || undefined;
            const query = {
                page: paginationParams.page,
                limit: paginationParams.limit,
                search: req.query.search || undefined,
                status: req.query.status || undefined,
                priority: req.query.priority || undefined,
                startDate: startDateStr ? new Date(startDateStr) : undefined,
                endDate: endDateStr ? new Date(endDateStr) : undefined
            };
            const result = await this.ticketService.list(providerId, query, req.user);
            res.json({
                success: true,
                data: result.tickets,
                pagination: result.pagination,
                message: 'Tickets listados com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao listar tickets';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Listar tickets globalmente (sem provider)
     * GET /api/tickets
     */
    async listAll(req, res) {
        try {
            const paginationParams = (0, paginationHelper_1.calculatePagination)({
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                maxLimit: 100,
                defaultLimit: 10
            });
            const startDateStr = req.query.startDate || undefined;
            const endDateStr = req.query.endDate || undefined;
            const query = {
                page: paginationParams.page,
                limit: paginationParams.limit,
                search: req.query.search || undefined,
                status: req.query.status || undefined,
                priority: req.query.priority || undefined,
                startDate: startDateStr ? new Date(startDateStr) : undefined,
                endDate: endDateStr ? new Date(endDateStr) : undefined
            };
            const result = await this.ticketService.listAll(query, req.user);
            res.json({
                success: true,
                data: result.tickets,
                pagination: result.pagination,
                message: 'Tickets listados com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao listar tickets';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Criar ticket para um provedor
     * POST /api/providers/:providerId/tickets
     */
    async create(req, res) {
        try {
            const providerId = parseInt(req.params.providerId);
            if (isNaN(providerId)) {
                res.status(400).json({ success: false, message: 'providerId inválido' });
                return;
            }
            const data = req.body;
            const ticket = await this.ticketService.create(providerId, data, req.user);
            res.status(201).json({
                success: true,
                data: ticket,
                message: 'Ticket criado com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar ticket';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Novo: criar ticket vinculado automaticamente ao provedor do usuário
     * POST /api/tickets
     */
    async createForCurrentProvider(req, res) {
        try {
            const providerId = req.user?.providerId;
            if (!providerId) {
                res.status(400).json({ success: false, message: 'Usuário não vinculado a um provedor' });
                return;
            }
            const data = req.body;
            const ticket = await this.ticketService.create(providerId, data, req.user);
            res.status(201).json({
                success: true,
                data: ticket,
                message: 'Ticket criado com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar ticket';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Obter ticket por ID
     * GET /api/tickets/:id
     */
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const ticket = await this.ticketService.getById(id, req.user);
            res.json({ success: true, data: ticket, message: 'Ticket obtido com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao obter ticket';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Atualizar ticket por ID
     * PUT /api/tickets/:id
     */
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const data = req.body;
            const ticket = await this.ticketService.update(id, data, req.user);
            res.json({ success: true, data: ticket, message: 'Ticket atualizado com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao atualizar ticket';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Alterar status do ticket
     * PUT /api/tickets/:id/status
     */
    async updateStatus(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const { status } = req.body;
            const ticket = await this.ticketService.updateStatus(id, status, req.user);
            res.json({ success: true, data: ticket, message: 'Status do ticket atualizado com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao atualizar status do ticket';
            const statusCode = error?.status || 500;
            res.status(statusCode).json({ success: false, message });
        }
    }
    /**
     * Remover ticket por ID
     * DELETE /api/tickets/:id
     */
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            await this.ticketService.delete(id, req.user);
            res.json({ success: true, message: 'Ticket removido com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao remover ticket';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Estatísticas de tickets por Provider
     * GET /api/providers/:providerId/tickets/stats
     */
    async getStats(req, res) {
        try {
            const providerId = parseInt(req.params.providerId);
            if (isNaN(providerId)) {
                res.status(400).json({ success: false, message: 'providerId inválido' });
                return;
            }
            const stats = await this.ticketService.getStats(providerId, req.user);
            res.json({ success: true, data: stats, message: 'Estatísticas obtidas com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao obter estatísticas';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Kanban por Provider
     * GET /api/providers/:providerId/tickets/kanban
     */
    async kanban(req, res) {
        try {
            const providerId = parseInt(req.params.providerId);
            if (isNaN(providerId)) {
                res.status(400).json({ success: false, message: 'providerId inválido' });
                return;
            }
            const limit = req.query.limit ? parseInt(String(req.query.limit)) : undefined;
            const board = await this.ticketService.getKanban(providerId, req.user, limit);
            res.json({ success: true, data: board, message: 'Kanban obtido com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao obter Kanban';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Kanban global (todos os tickets acessíveis ao usuário)
     * GET /api/tickets/kanban
     */
    async kanbanAll(req, res) {
        try {
            const { providerId } = req.query;
            const limit = req.query.limit ? parseInt(String(req.query.limit)) : undefined;
            if (providerId) {
                const id = parseInt(providerId);
                if (isNaN(id)) {
                    res.status(400).json({ success: false, message: 'providerId inválido' });
                    return;
                }
                const board = await this.ticketService.getKanban(id, req.user, limit);
                res.json({ success: true, data: board, message: 'Kanban obtido com sucesso' });
                return;
            }
            const board = await this.ticketService.getKanbanAll(req.user, limit);
            res.json({ success: true, data: board, message: 'Kanban obtido com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao obter Kanban';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Histórico de mudanças do ticket
     * GET /api/tickets/:id/history
     */
    async history(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const { page, limit } = (0, paginationHelper_1.calculatePagination)({
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                maxLimit: 100,
                defaultLimit: 20
            });
            const result = await this.ticketService.getHistory(id, req.user, page, limit);
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
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
}
exports.TicketController = TicketController;
