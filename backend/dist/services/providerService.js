"use strict";
// Service para lógica de negócio dos provedores
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderService = void 0;
const providerRepository_1 = require("../repositories/providerRepository");
const crypto_1 = require("crypto");
class ProviderService {
    constructor() {
        this.providerRepository = new providerRepository_1.ProviderRepository();
    }
    /**
     * Criar um novo provedor
     */
    async create(data, createdBy) {
        try {
            // Validar dados obrigatórios
            this.validateCreateData(data);
            // Gerar workspace único se não fornecido
            if (!data.workspace) {
                data.workspace = await this.generateUniqueWorkspace(data.name);
            }
            // Configurações padrão do provedor
            const defaultSettings = {
                timezone: 'America/Sao_Paulo',
                language: 'pt-BR',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '24h',
                currency: 'BRL',
                ticketSettings: {
                    autoAssignment: false,
                    defaultPriority: 'medium',
                    escalationRules: [],
                    slaSettings: {
                        enabled: false,
                        responseTime: {},
                        resolutionTime: {},
                        businessHours: {
                            monday: { start: '08:00', end: '18:00', enabled: true },
                            tuesday: { start: '08:00', end: '18:00', enabled: true },
                            wednesday: { start: '08:00', end: '18:00', enabled: true },
                            thursday: { start: '08:00', end: '18:00', enabled: true },
                            friday: { start: '08:00', end: '18:00', enabled: true },
                            saturday: { start: '08:00', end: '12:00', enabled: true },
                            sunday: { start: '08:00', end: '12:00', enabled: false },
                            holidays: []
                        }
                    },
                    customFields: []
                },
                notificationSettings: {
                    emailNotifications: true,
                    smsNotifications: false,
                    pushNotifications: true,
                    webhookUrl: undefined,
                    notifyOnTicketCreate: true,
                    notifyOnTicketUpdate: true,
                    notifyOnTicketClose: true,
                    notifyOnEquipmentAlert: true
                },
                securitySettings: {
                    requireTwoFactor: false,
                    passwordPolicy: {
                        minLength: 8,
                        requireUppercase: true,
                        requireLowercase: true,
                        requireNumbers: true,
                        requireSymbols: false,
                        maxAge: 90,
                        preventReuse: 5
                    },
                    sessionTimeout: 480,
                    ipWhitelist: [],
                    allowApiAccess: false,
                    auditLogRetention: 90
                },
                integrationSettings: {
                    zabbixEnabled: false,
                    apiEnabled: false,
                    webhooksEnabled: false,
                    allowedOrigins: [],
                    rateLimiting: {
                        enabled: false,
                        requestsPerMinute: 60,
                        requestsPerHour: 1000,
                        requestsPerDay: 10000
                    }
                }
            };
            // Criar o provedor
            const provider = await this.providerRepository.create({
                ...data,
                settings: defaultSettings,
                status: 'active',
                createdBy,
                updatedBy: createdBy
            });
            // Vincular o criador como membro administrador ativo do provedor
            await this.providerRepository.addProviderUser(provider.id, createdBy, 'admin', []);
            // Placeholder de retorno para compatibilidade (nenhum usuário é criado aqui)
            const adminUser = {
                id: createdBy,
                email: '',
                temporaryPassword: ''
            };
            return {
                provider,
                adminUser,
                message: 'Provedor criado com sucesso'
            };
        }
        catch (error) {
            console.error('Erro no ProviderService.create:', error);
            throw new Error(`Erro ao criar provedor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Listar provedores com filtros e paginação
     */
    async list(query, user) {
        try {
            // Aplicar filtros baseados no papel do usuário
            const filteredQuery = this.applyUserFilters(query, user);
            const result = await this.providerRepository.list(filteredQuery);
            return {
                providers: result.providers,
                pagination: result.pagination
            };
        }
        catch (error) {
            console.error('Erro no ProviderService.list:', error);
            throw new Error(`Erro ao listar provedores: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Buscar provedor por ID
     */
    async findById(id, user) {
        try {
            const provider = await this.providerRepository.findById(id);
            if (!provider) {
                return null;
            }
            // Verificar se o usuário tem acesso ao provedor
            // Papéis globais têm acesso amplo
            let allowed = false;
            if (user.role === 'super_admin' || user.role === 'admin') {
                allowed = true;
            }
            else if (user?.providerId && user.providerId === provider.id) {
                // Fallback: se o token já estiver vinculado ao provider, permitir
                allowed = true;
            }
            else {
                // Caso contrário, verificar vínculo via banco (owner ou membro ativo)
                allowed = await this.userHasAccess(user.id, provider.id);
            }
            if (!allowed) {
                const err = new Error('Acesso negado ao provedor');
                err.status = 403;
                throw err;
            }
            return provider;
        }
        catch (error) {
            console.error('Erro no ProviderService.findById:', error);
            throw new Error(`Erro ao buscar provedor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Buscar provedor por workspace
     */
    async findByWorkspace(workspace) {
        try {
            return await this.providerRepository.findByWorkspace(workspace);
        }
        catch (error) {
            console.error('Erro no ProviderService.findByWorkspace:', error);
            throw new Error(`Erro ao buscar provedor por workspace: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Buscar provedor por CNPJ
     */
    async findByCnpj(cnpj) {
        try {
            return await this.providerRepository.findByCnpj(cnpj);
        }
        catch (error) {
            console.error('Erro no ProviderService.findByCnpj:', error);
            throw new Error(`Erro ao buscar provedor por CNPJ: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Atualizar provedor
     */
    async update(id, data, updatedBy) {
        try {
            // Verificar se o workspace já existe (se fornecido)
            // Nota: workspace não está no UpdateProviderDto, removendo esta verificação
            // Validar se o CNPJ não está em uso por outro provedor
            if (data.cnpj) {
                const existingProvider = await this.providerRepository.findByCnpj(data.cnpj);
                if (existingProvider && existingProvider.id !== id) {
                    throw new Error('CNPJ já está em uso por outro provedor');
                }
            }
            const provider = await this.providerRepository.update(id, {
                ...data,
                updatedBy,
                updatedAt: new Date()
            });
            if (!provider) {
                throw new Error('Provedor não encontrado');
            }
            return {
                provider,
                message: 'Provedor atualizado com sucesso'
            };
        }
        catch (error) {
            console.error('Erro no ProviderService.update:', error);
            throw new Error(`Erro ao atualizar provedor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Excluir provedor (soft delete)
     */
    async delete(id, deletedBy) {
        try {
            const success = await this.providerRepository.delete(id, deletedBy);
            if (!success) {
                throw new Error('Provedor não encontrado');
            }
        }
        catch (error) {
            console.error('Erro no ProviderService.delete:', error);
            throw new Error(`Erro ao excluir provedor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Atualizar status do provedor
     */
    async updateStatus(id, status, updatedBy) {
        try {
            const provider = await this.providerRepository.updateStatus(id, status, updatedBy);
            if (!provider) {
                throw new Error('Provedor não encontrado');
            }
            return provider;
        }
        catch (error) {
            console.error('Erro no ProviderService.updateStatus:', error);
            throw new Error(`Erro ao atualizar status do provedor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Obter estatísticas do provedor
     */
    async getStats(providerId) {
        try {
            return await this.providerRepository.getStats(providerId);
        }
        catch (error) {
            console.error('Erro no ProviderService.getStats:', error);
            throw new Error(`Erro ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Convidar usuário para o provedor
     */
    async inviteUser(providerId, data, invitedBy) {
        try {
            // Verificar se o usuário já está no provedor
            const existingUser = await this.providerRepository.findUserByEmail(providerId, data.email);
            if (existingUser) {
                throw new Error('Usuário já faz parte deste provedor');
            }
            // Verificar se já existe um convite pendente
            const existingInvite = await this.providerRepository.findPendingInvite('');
            if (existingInvite) {
                throw new Error('Já existe um convite pendente para este email');
            }
            // Criar o convite
            const invite = {
                id: (0, crypto_1.randomUUID)(), // Gerar UUID para o convite
                providerId,
                email: data.email,
                role: data.role,
                invitedBy: invitedBy,
                token: (0, crypto_1.randomUUID)(), // Token único para o convite
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            return await this.providerRepository.createInvite(invite);
        }
        catch (error) {
            console.error('Erro no ProviderService.inviteUser:', error);
            throw new Error(`Erro ao convidar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Listar usuários do provedor
     */
    async getUsers(providerId) {
        try {
            return await this.providerRepository.getUsers(providerId);
        }
        catch (error) {
            console.error('Erro no ProviderService.getUsers:', error);
            throw new Error(`Erro ao listar usuários: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Atualizar configurações do provedor
     */
    async updateSettings(providerId, settings, updatedBy) {
        try {
            const provider = await this.providerRepository.updateSettings(providerId, settings, updatedBy);
            if (!provider) {
                throw new Error('Provedor não encontrado');
            }
            return provider;
        }
        catch (error) {
            console.error('Erro no ProviderService.updateSettings:', error);
            throw new Error(`Erro ao atualizar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Verificar se workspace está disponível
     */
    async isWorkspaceAvailable(workspace) {
        try {
            const provider = await this.providerRepository.findByWorkspace(workspace);
            return !provider;
        }
        catch (error) {
            console.error('Erro no ProviderService.isWorkspaceAvailable:', error);
            throw new Error(`Erro ao verificar workspace: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Verificar se usuário tem acesso ao provedor
     */
    async userHasAccess(userId, providerId) {
        try {
            return await this.providerRepository.userHasAccess(userId, providerId);
        }
        catch (error) {
            console.error('Erro no ProviderService.userHasAccess:', error);
            return false;
        }
    }
    /**
     * Obter vínculo e permissões do usuário no provedor
     */
    async getProviderUser(userId, providerId) {
        try {
            return await this.providerRepository.getProviderUser(userId, providerId);
        }
        catch (error) {
            console.error('Erro no ProviderService.getProviderUser:', error);
            return null;
        }
    }
    /**
     * Verificar permissão granular por provedor
     */
    async hasPermission(user, providerId, permission) {
        try {
            // Papéis globais têm acesso amplo
            if (user.role === 'super_admin' || user.role === 'admin') {
                return true;
            }
            const membership = await this.getProviderUser(user.id, providerId);
            if (!membership || membership.status !== 'active') {
                return false;
            }
            // Dono e manager têm todas as permissões do provedor
            if (membership.role === 'admin' || membership.role === 'manager') {
                return true;
            }
            return (membership.permissions || []).includes(permission);
        }
        catch (error) {
            console.error('Erro no ProviderService.hasPermission:', error);
            return false;
        }
    }
    // Métodos privados
    /**
     * Validar dados de criação do provedor
     */
    validateCreateData(data) {
        if (!data.name || data.name.trim().length < 2) {
            throw new Error('Nome do provedor deve ter pelo menos 2 caracteres');
        }
        if (!data.cnpj || !this.isValidCnpj(data.cnpj)) {
            throw new Error('CNPJ inválido');
        }
        if (!data.email || !this.isValidEmail(data.email)) {
            throw new Error('Email inválido');
        }
        if (data.workspace && !this.isValidWorkspace(data.workspace)) {
            throw new Error('Workspace deve conter apenas letras, números e hífens, com 3-50 caracteres');
        }
    }
    /**
     * Gerar workspace único baseado no nome
     */
    async generateUniqueWorkspace(name) {
        let baseWorkspace = name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 30);
        let workspace = baseWorkspace;
        let counter = 1;
        while (!(await this.isWorkspaceAvailable(workspace))) {
            workspace = `${baseWorkspace}-${counter}`;
            counter++;
        }
        return workspace;
    }
    /**
     * Aplicar filtros baseados no usuário
     */
    applyUserFilters(query, user) {
        // Super admin pode ver todos os provedores
        if (user.role && user.role === 'super_admin') {
            return query;
        }
        // Filtrar provedores baseado no usuário (se não for super_admin)
        if (user.providerId) {
            return {
                ...query,
                userProviderId: user.providerId
            };
        }
        // Se não tem providerId, retorna query vazia (não pode ver nenhum provedor)
        return {
            ...query,
            userProviderId: -1 // ID impossível para não retornar nada
        };
    }
    /**
     * Verificar se usuário tem acesso ao provedor
     */
    userHasAccessToProvider(user, provider) {
        // Super admin tem acesso a tudo
        if (user.role && user.role === 'super_admin') {
            return true;
        }
        return user.providerId === provider.id;
    }
    /**
     * Validar CNPJ
     */
    isValidCnpj(cnpj) {
        // Remove caracteres não numéricos
        const cleanCnpj = cnpj.replace(/[^\d]/g, '');
        // Verifica se tem 14 dígitos
        if (cleanCnpj.length !== 14) {
            return false;
        }
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cleanCnpj)) {
            return false;
        }
        // Validação dos dígitos verificadores
        let sum = 0;
        let weight = 5;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cleanCnpj[i]) * weight;
            weight = weight === 2 ? 9 : weight - 1;
        }
        let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (parseInt(cleanCnpj[12]) !== digit1) {
            return false;
        }
        sum = 0;
        weight = 6;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cleanCnpj[i]) * weight;
            weight = weight === 2 ? 9 : weight - 1;
        }
        let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        return parseInt(cleanCnpj[13]) === digit2;
    }
    /**
     * Validar email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Validar workspace
     */
    isValidWorkspace(workspace) {
        const workspaceRegex = /^[a-z0-9-]{3,50}$/;
        return workspaceRegex.test(workspace) && !workspace.startsWith('-') && !workspace.endsWith('-');
    }
}
exports.ProviderService = ProviderService;
