"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentController = void 0;
const equipmentService_1 = require("../services/equipmentService");
const paginationHelper_1 = require("../utils/paginationHelper");
class EquipmentController {
    constructor() {
        this.equipmentService = new equipmentService_1.EquipmentService();
    }
    /**
     * Listar equipamentos de um provedor
     * GET /api/providers/:providerId/equipments
     */
    async list(req, res) {
        try {
            const providerId = parseInt(req.params.providerId);
            if (isNaN(providerId)) {
                res.status(400).json({ success: false, message: 'providerId inválido' });
                return;
            }
            const query = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                search: req.query.search || undefined,
                type: req.query.type || undefined,
                status: req.query.status || undefined
            };
            const result = await this.equipmentService.list(providerId, query, req.user);
            res.json({
                success: true,
                data: result.equipments,
                pagination: result.pagination,
                message: 'Equipamentos listados com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao listar equipamentos';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Criar equipamento para um provedor
     * POST /api/providers/:providerId/equipments
     */
    async create(req, res) {
        try {
            const providerId = parseInt(req.params.providerId);
            if (isNaN(providerId)) {
                res.status(400).json({ success: false, message: 'providerId inválido' });
                return;
            }
            const data = req.body;
            const equipment = await this.equipmentService.create(providerId, data, req.user);
            res.status(201).json({
                success: true,
                data: equipment,
                message: 'Equipamento criado com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar equipamento';
            const isConflict = typeof message === 'string' && message.includes('Serial já está em uso');
            const status = error?.status || (isConflict ? 409 : 500);
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Obter equipamento por ID
     * GET /api/equipments/:id
     */
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const equipment = await this.equipmentService.getById(id, req.user);
            res.json({ success: true, data: equipment, message: 'Equipamento obtido com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao obter equipamento';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Atualizar equipamento por ID
     * PUT /api/equipments/:id
     */
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const data = req.body;
            const equipment = await this.equipmentService.update(id, data, req.user);
            res.json({ success: true, data: equipment, message: 'Equipamento atualizado com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao atualizar equipamento';
            const isConflict = typeof message === 'string' && message.includes('Serial já está em uso');
            const status = error?.status || (isConflict ? 409 : 500);
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Remover equipamento por ID
     * DELETE /api/equipments/:id
     */
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            await this.equipmentService.delete(id, req.user);
            res.json({ success: true, message: 'Equipamento removido com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao remover equipamento';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Estatísticas de equipamentos por Provider
     * GET /api/providers/:providerId/equipments/stats
     */
    async getStats(req, res) {
        try {
            const providerId = parseInt(req.params.providerId);
            if (isNaN(providerId)) {
                res.status(400).json({ success: false, message: 'providerId inválido' });
                return;
            }
            const stats = await this.equipmentService.getStats(providerId, req.user);
            res.json({ success: true, data: stats, message: 'Estatísticas obtidas com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao obter estatísticas';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Histórico de mudanças do equipamento
     * GET /api/equipments/:id/history
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
            const result = await this.equipmentService.getHistory(id, req.user, page, limit);
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
            const message = error instanceof Error ? error.message : 'Erro ao obter histórico do equipamento';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
}
exports.EquipmentController = EquipmentController;
