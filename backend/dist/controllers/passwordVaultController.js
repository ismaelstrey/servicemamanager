"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordVaultController = void 0;
const passwordVaultService_1 = require("../services/passwordVaultService");
class PasswordVaultController {
    constructor() {
        this.service = new passwordVaultService_1.PasswordVaultService();
    }
    /**
     * Listar senhas de um provedor
     * GET /api/providers/:providerId/passwords
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
                search: req.query.search || undefined
            };
            const result = await this.service.list(providerId, query, req.user);
            res.json({
                success: true,
                data: result.items,
                pagination: result.pagination,
                message: 'Senhas listadas com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao listar senhas';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Criar entrada de senha
     * POST /api/providers/:providerId/passwords
     */
    async create(req, res) {
        try {
            const providerId = parseInt(req.params.providerId);
            if (isNaN(providerId)) {
                res.status(400).json({ success: false, message: 'providerId inválido' });
                return;
            }
            const data = req.body;
            const created = await this.service.create(providerId, data, req.user);
            res.status(201).json({ success: true, data: created, message: 'Senha criada com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar senha';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Obter entrada por ID
     * GET /api/passwords/:id
     */
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const item = await this.service.getById(id, req.user);
            res.json({ success: true, data: item, message: 'Senha obtida com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao obter senha';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Atualizar entrada
     * PUT /api/passwords/:id
     */
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const data = req.body;
            const updated = await this.service.update(id, data, req.user);
            res.json({ success: true, data: updated, message: 'Senha atualizada com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao atualizar senha';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Remover entrada
     * DELETE /api/passwords/:id
     */
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            await this.service.delete(id, req.user);
            res.json({ success: true, message: 'Senha removida com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao remover senha';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
}
exports.PasswordVaultController = PasswordVaultController;
