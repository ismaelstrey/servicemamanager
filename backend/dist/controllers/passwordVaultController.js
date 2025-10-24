"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordVaultController = void 0;
const passwordVaultService_1 = require("../services/passwordVaultService");
const auditLogger_1 = require("../utils/auditLogger");
const paginationHelper_1 = require("../utils/paginationHelper");
class PasswordVaultController {
    constructor() {
        this.service = new passwordVaultService_1.PasswordVaultService();
    }
    /**
     * Listar senhas de um provedor
     * GET /api/providers/:providerId/passwords
     */
    async list(req, res) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        const providerId = parseInt(req.params.providerId);
        try {
            if (isNaN(providerId)) {
                res.status(400).json({ success: false, message: 'providerId inválido' });
                return;
            }
            // Usar helper de paginação otimizada
            const paginationParams = (0, paginationHelper_1.calculatePagination)({
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                maxLimit: 50,
                defaultLimit: 10
            });
            const query = {
                page: paginationParams.page,
                limit: paginationParams.limit,
                search: req.query.search || undefined
            };
            const result = await this.service.list(providerId, query, req.user);
            // Log de auditoria para listagem bem-sucedida
            (0, auditLogger_1.logPasswordVaultAudit)('read', req.user.id.toString(), req.user.email, 'list', providerId.toString(), true, ipAddress, userAgent, undefined, { query });
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
            // Log de auditoria para listagem falhada
            (0, auditLogger_1.logPasswordVaultAudit)('read', req.user.id.toString(), req.user.email, 'list', providerId.toString(), false, ipAddress, userAgent, message);
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Criar entrada de senha
     * POST /api/providers/:providerId/passwords
     */
    async create(req, res) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        const providerId = parseInt(req.params.providerId);
        try {
            if (isNaN(providerId)) {
                res.status(400).json({ success: false, message: 'providerId inválido' });
                return;
            }
            const data = req.body;
            const created = await this.service.create(providerId, data, req.user);
            // Log de auditoria para criação bem-sucedida
            (0, auditLogger_1.logPasswordVaultAudit)('create', req.user.id.toString(), req.user.email, created.id.toString(), providerId.toString(), true, ipAddress, userAgent, undefined, { title: data.label, category: undefined });
            res.status(201).json({ success: true, data: created, message: 'Senha criada com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar senha';
            const status = error?.status || 500;
            // Log de auditoria para criação falhada
            (0, auditLogger_1.logPasswordVaultAudit)('create', req.user.id.toString(), req.user.email, 'unknown', providerId.toString(), false, ipAddress, userAgent, message);
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Obter entrada por ID
     * GET /api/passwords/:id
     */
    async getById(req, res) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        const id = parseInt(req.params.id);
        try {
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const item = await this.service.getById(id, req.user);
            // Log de auditoria para leitura bem-sucedida
            (0, auditLogger_1.logPasswordVaultAudit)('read', req.user.id.toString(), req.user.email, id.toString(), item.providerId.toString(), true, ipAddress, userAgent, undefined, { title: item.label });
            // Log adicional de auditoria para descriptografia (quando usuário pode ver segredos)
            if (item.password) {
                (0, auditLogger_1.logPasswordVaultAudit)('decrypt', req.user.id.toString(), req.user.email, id.toString(), item.providerId.toString(), true, ipAddress, userAgent, undefined, { title: item.label });
            }
            res.json({ success: true, data: item, message: 'Senha obtida com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao obter senha';
            const status = error?.status || 500;
            // Log de auditoria para leitura falhada
            (0, auditLogger_1.logPasswordVaultAudit)('read', req.user.id.toString(), req.user.email, id.toString(), 'unknown', false, ipAddress, userAgent, message);
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Atualizar entrada
     * PUT /api/passwords/:id
     */
    async update(req, res) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        const id = parseInt(req.params.id);
        try {
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const data = req.body;
            const updated = await this.service.update(id, data, req.user);
            // Log de auditoria para atualização bem-sucedida
            (0, auditLogger_1.logPasswordVaultAudit)('update', req.user.id.toString(), req.user.email, id.toString(), updated.providerId.toString(), true, ipAddress, userAgent, undefined, { title: updated.label, category: undefined });
            res.json({ success: true, data: updated, message: 'Senha atualizada com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao atualizar senha';
            const status = error?.status || 500;
            // Log de auditoria para atualização falhada
            (0, auditLogger_1.logPasswordVaultAudit)('update', req.user.id.toString(), req.user.email, id.toString(), 'unknown', false, ipAddress, userAgent, message);
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Rotacionar senha
     * POST /api/passwords/:id/rotate
     */
    async rotate(req, res) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        const id = parseInt(req.params.id);
        try {
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const options = req.body || {};
            const updated = await this.service.rotate(id, req.user, options);
            // Log de auditoria para rotação bem-sucedida (usando ação update)
            (0, auditLogger_1.logPasswordVaultAudit)('update', req.user.id.toString(), req.user.email, id.toString(), updated.providerId.toString(), true, ipAddress, userAgent, undefined, { action: 'rotate' });
            res.json({ success: true, data: updated, message: 'Senha rotacionada com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao rotacionar senha';
            const status = error?.status || 500;
            // Log de auditoria para rotação falhada
            (0, auditLogger_1.logPasswordVaultAudit)('update', req.user.id.toString(), req.user.email, id.toString(), 'unknown', false, ipAddress, userAgent, message, { action: 'rotate' });
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Remover entrada
     * DELETE /api/passwords/:id
     */
    async delete(req, res) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        const id = parseInt(req.params.id);
        try {
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            // Obter informações antes de deletar para o log
            const item = await this.service.getById(id, req.user);
            await this.service.delete(id, req.user);
            // Log de auditoria para exclusão bem-sucedida
            (0, auditLogger_1.logPasswordVaultAudit)('delete', req.user.id.toString(), req.user.email, id.toString(), item.providerId.toString(), true, ipAddress, userAgent, undefined, { title: item.label });
            // Log adicional de auditoria para descriptografia (quando usuário pode ver segredos ao recuperar antes da exclusão)
            if (item.password) {
                (0, auditLogger_1.logPasswordVaultAudit)('decrypt', req.user.id.toString(), req.user.email, id.toString(), item.providerId.toString(), true, ipAddress, userAgent, undefined, { title: item.label });
            }
            res.json({ success: true, message: 'Senha removida com sucesso' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao remover senha';
            const status = error?.status || 500;
            // Log de auditoria para exclusão falhada
            (0, auditLogger_1.logPasswordVaultAudit)('delete', req.user.id.toString(), req.user.email, id.toString(), 'unknown', false, ipAddress, userAgent, message);
            res.status(status).json({ success: false, message });
        }
    }
}
exports.PasswordVaultController = PasswordVaultController;
