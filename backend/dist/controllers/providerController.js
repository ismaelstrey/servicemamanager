"use strict";
// Controller para gerenciamento de provedores
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderController = void 0;
const providerService_1 = require("../services/providerService");
const auditLogger_1 = require("../utils/auditLogger");
const paginationHelper_1 = require("../utils/paginationHelper");
class ProviderController {
    constructor() {
        this.providerService = new providerService_1.ProviderService();
    }
    /**
     * Criar um novo provedor
     * POST /api/providers
     */
    async create(req, res) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        try {
            const createData = req.body;
            // Validar se o workspace já existe
            const existingProvider = await this.providerService.findByWorkspace(createData.workspace);
            if (existingProvider) {
                res.status(409).json({
                    success: false,
                    message: 'Workspace já está em uso',
                    error: 'WORKSPACE_ALREADY_EXISTS'
                });
                return;
            }
            // Validar se o CNPJ já existe
            const existingCnpj = await this.providerService.findByCnpj(createData.cnpj);
            if (existingCnpj) {
                res.status(409).json({
                    success: false,
                    message: 'CNPJ já está cadastrado',
                    error: 'CNPJ_ALREADY_EXISTS'
                });
                return;
            }
            const result = await this.providerService.create(createData, req.user?.id || 0);
            // Log de auditoria para criação bem-sucedida
            (0, auditLogger_1.logProviderAudit)('create', req.user.id.toString(), req.user.email, result.provider.id.toString(), true, ipAddress, userAgent, undefined, { name: result.provider.name, workspace: result.provider.workspace });
            res.status(201).json({
                success: true,
                data: result,
                message: 'Provedor criado com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar provedor';
            const status = error?.status || 500;
            // Log de auditoria para criação falhada
            (0, auditLogger_1.logProviderAudit)('create', req.user.id.toString(), req.user.email, 'unknown', false, ipAddress, userAgent, message);
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Listar provedores com filtros e paginação
     * GET /api/providers
     */
    async list(req, res) {
        try {
            // Usar helper de paginação otimizada
            const paginationParams = (0, paginationHelper_1.calculatePagination)({
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                maxLimit: 100,
                defaultLimit: 10
            });
            const query = {
                page: paginationParams.page,
                limit: paginationParams.limit,
                search: req.query.search,
                status: req.query.status,
                plan: req.query.plan,
                sortBy: req.query.sortBy || 'createdAt',
                sortOrder: req.query.sortOrder || 'desc'
            };
            const result = await this.providerService.list(query, req.user);
            res.json({
                success: true,
                data: result.providers,
                pagination: result.pagination,
                message: 'Provedores listados com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao listar provedores:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Obter detalhes de um provedor específico
     * GET /api/providers/:id
     */
    async getById(req, res) {
        try {
            const providerId = parseInt(req.params.id);
            if (isNaN(providerId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID do provedor inválido'
                });
                return;
            }
            const provider = await this.providerService.findById(providerId, req.user);
            if (!provider) {
                res.status(404).json({
                    success: false,
                    message: 'Provedor não encontrado'
                });
                return;
            }
            res.json({
                success: true,
                data: provider,
                message: 'Provedor encontrado com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao buscar provedor:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Obter provedor por workspace
     * GET /api/providers/workspace/:workspace
     */
    async getByWorkspace(req, res) {
        try {
            const workspace = req.params.workspace;
            const provider = await this.providerService.findByWorkspace(workspace);
            if (!provider) {
                res.status(404).json({
                    success: false,
                    message: 'Provedor não encontrado'
                });
                return;
            }
            // Verificar se o usuário tem acesso a este provedor
            const hasAccess = await this.providerService.userHasAccess(req.user?.id || 0, provider.id);
            if (!hasAccess && req.user?.role !== 'super_admin') {
                res.status(403).json({
                    success: false,
                    message: 'Acesso negado'
                });
                return;
            }
            res.json({
                success: true,
                data: provider,
                message: 'Provedor encontrado com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao buscar provedor por workspace:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Atualizar um provedor
     * PUT /api/providers/:id
     */
    async update(req, res) {
        try {
            const providerId = parseInt(req.params.id);
            const updateData = req.body;
            if (isNaN(providerId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID do provedor inválido'
                });
                return;
            }
            // Verificar se o provedor existe e se o usuário tem acesso
            const existingProvider = await this.providerService.findById(providerId, req.user);
            if (!existingProvider) {
                res.status(404).json({
                    success: false,
                    message: 'Provedor não encontrado'
                });
                return;
            }
            const result = await this.providerService.update(providerId, updateData, req.user?.id || 0);
            res.json({
                success: true,
                data: result,
                message: 'Provedor atualizado com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao atualizar provedor:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Excluir um provedor (soft delete)
     * DELETE /api/providers/:id
     */
    async delete(req, res) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        const providerId = parseInt(req.params.id);
        try {
            if (isNaN(providerId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID do provedor inválido'
                });
                return;
            }
            // Verificar se o provedor existe e se o usuário tem acesso
            const existingProvider = await this.providerService.findById(providerId, req.user);
            if (!existingProvider) {
                res.status(404).json({
                    success: false,
                    message: 'Provedor não encontrado'
                });
                return;
            }
            // Verificar se o usuário tem permissão para excluir
            if (req.user?.role !== 'super_admin' && req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Permissão insuficiente para excluir provedor'
                });
                return;
            }
            await this.providerService.delete(providerId, req.user?.id || 0);
            // Log de auditoria para exclusão bem-sucedida
            (0, auditLogger_1.logProviderAudit)('delete', req.user.id.toString(), req.user.email, providerId.toString(), true, ipAddress, userAgent, undefined, { name: existingProvider.name, workspace: existingProvider.workspace });
            res.json({
                success: true,
                message: 'Provedor excluído com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao excluir provedor';
            const status = error?.status || 500;
            // Log de auditoria para exclusão falhada
            (0, auditLogger_1.logProviderAudit)('delete', req.user.id.toString(), req.user.email, providerId.toString(), false, ipAddress, userAgent, message);
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Ativar/Desativar um provedor
     * PATCH /api/providers/:id/status
     */
    async toggleStatus(req, res) {
        try {
            const providerId = parseInt(req.params.id);
            const { status } = req.body;
            if (isNaN(providerId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID do provedor inválido'
                });
                return;
            }
            if (!['active', 'inactive'].includes(status)) {
                res.status(400).json({
                    success: false,
                    message: 'Status inválido. Use "active" ou "inactive"'
                });
                return;
            }
            // Verificar permissões
            if (req.user?.role !== 'super_admin') {
                res.status(403).json({
                    success: false,
                    message: 'Apenas super administradores podem alterar status de provedores'
                });
                return;
            }
            const result = await this.providerService.updateStatus(providerId, status, req.user?.id || 0);
            res.json({
                success: true,
                data: result,
                message: `Provedor ${status === 'active' ? 'ativado' : 'desativado'} com sucesso`
            });
        }
        catch (error) {
            console.error('Erro ao alterar status do provedor:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Obter estatísticas de um provedor
     * GET /api/providers/:id/stats
     */
    async getStats(req, res) {
        try {
            const providerId = parseInt(req.params.id);
            if (isNaN(providerId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID do provedor inválido'
                });
                return;
            }
            // Verificar se o provedor existe e se o usuário tem acesso
            const existingProvider = await this.providerService.findById(providerId, req.user);
            if (!existingProvider) {
                res.status(404).json({
                    success: false,
                    message: 'Provedor não encontrado'
                });
                return;
            }
            const stats = await this.providerService.getStats(providerId);
            res.json({
                success: true,
                data: stats,
                message: 'Estatísticas obtidas com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao obter estatísticas do provedor:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Convidar usuário para o provedor
     * POST /api/providers/:id/invite
     */
    async inviteUser(req, res) {
        try {
            const providerId = parseInt(req.params.id);
            const inviteData = req.body;
            if (isNaN(providerId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID do provedor inválido'
                });
                return;
            }
            // Verificar se o provedor existe e se o usuário tem acesso
            const existingProvider = await this.providerService.findById(providerId, req.user);
            if (!existingProvider) {
                res.status(404).json({
                    success: false,
                    message: 'Provedor não encontrado'
                });
                return;
            }
            // Verificar permissões para convidar usuários
            if (!['super_admin', 'admin', 'manager'].includes(req.user?.role || '')) {
                res.status(403).json({
                    success: false,
                    message: 'Permissão insuficiente para convidar usuários'
                });
                return;
            }
            const invite = await this.providerService.inviteUser(providerId, inviteData, req.user?.id || 0);
            res.status(201).json({
                success: true,
                data: invite,
                message: 'Convite enviado com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao convidar usuário:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Listar usuários do provedor
     * GET /api/providers/:id/users
     */
    async getUsers(req, res) {
        try {
            const providerId = parseInt(req.params.id);
            if (isNaN(providerId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID do provedor inválido'
                });
                return;
            }
            // Verificar se o provedor existe e se o usuário tem acesso
            const existingProvider = await this.providerService.findById(providerId, req.user);
            if (!existingProvider) {
                res.status(404).json({
                    success: false,
                    message: 'Provedor não encontrado'
                });
                return;
            }
            const users = await this.providerService.getUsers(providerId);
            res.json({
                success: true,
                data: users,
                message: 'Usuários listados com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao listar usuários do provedor:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Atualizar configurações do provedor
     * PUT /api/providers/:id/settings
     */
    async updateSettings(req, res) {
        try {
            const providerId = parseInt(req.params.id);
            const settings = req.body;
            if (isNaN(providerId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID do provedor inválido'
                });
                return;
            }
            // Verificar se o provedor existe e se o usuário tem acesso
            const existingProvider = await this.providerService.findById(providerId, req.user);
            if (!existingProvider) {
                res.status(404).json({
                    success: false,
                    message: 'Provedor não encontrado'
                });
                return;
            }
            // Verificar permissões para alterar configurações
            if (!req.user || !['super_admin', 'admin'].includes(req.user.role)) {
                res.status(403).json({
                    success: false,
                    message: 'Permissão insuficiente para alterar configurações'
                });
                return;
            }
            const result = await this.providerService.updateSettings(providerId, settings, req.user.id);
            res.json({
                success: true,
                data: result,
                message: 'Configurações atualizadas com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao atualizar configurações do provedor:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Verificar disponibilidade de workspace
     * GET /api/providers/check-workspace/:workspace
     */
    async checkWorkspace(req, res) {
        try {
            const workspace = req.params.workspace;
            if (!workspace || workspace.length < 3) {
                res.status(400).json({
                    success: false,
                    message: 'Workspace deve ter pelo menos 3 caracteres'
                });
                return;
            }
            const isAvailable = await this.providerService.isWorkspaceAvailable(workspace);
            res.json({
                success: true,
                data: {
                    workspace,
                    available: isAvailable
                },
                message: isAvailable ? 'Workspace disponível' : 'Workspace já está em uso'
            });
        }
        catch (error) {
            console.error('Erro ao verificar workspace:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.ProviderController = ProviderController;
