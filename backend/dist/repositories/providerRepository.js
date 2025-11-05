"use strict";
// Repository para acesso aos dados dos provedores
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderRepository = void 0;
const prisma_1 = require("../lib/prisma");
class ProviderRepository {
    constructor() {
        this.prisma = prisma_1.prisma;
    }
    /**
     * Criar um novo provedor
     */
    async create(data) {
        try {
            const provider = await this.prisma.provider.create({
                data: {
                    name: data.name,
                    cnpj: data.cnpj,
                    workspace: data.workspace,
                    ownerId: data.createdBy
                },
                include: {
                    providerUsers: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                    // Removendo status pois não existe no schema User
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            providerUsers: true,
                            equipments: true,
                            tickets: true
                        }
                    }
                }
            });
            return this.mapProviderFromPrisma(provider);
        }
        catch (error) {
            console.error('Erro no ProviderRepository.create:', error);
            throw new Error(`Erro ao criar provedor no banco: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Listar provedores com filtros e paginação
     */
    async list(query) {
        try {
            const { page = 1, limit = 10, search, status, plan, sortBy = 'createdAt', sortOrder = 'desc', userProviders } = query;
            const skip = (page - 1) * limit;
            // Construir filtros
            const where = {
            // Não incluir provedores excluídos (campo removido do schema)
            };
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { cnpj: { contains: search } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { workspace: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (status) {
                // Campo status removido do schema - ignorando filtro
                // where.status = status;
            }
            if (plan) {
                // Campo plan removido do schema - ignorando filtro
                // where.plan = plan;
            }
            // Filtrar por provedores do usuário (se não for super admin)
            if (userProviders && userProviders.length > 0) {
                where.id = { in: userProviders };
            }
            // Contar total de registros
            const total = await this.prisma.provider.count({ where });
            // Buscar provedores
            const providers = await this.prisma.provider.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    providerUsers: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                    // Removendo status pois não existe no schema User
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            providerUsers: true,
                            equipments: true,
                            tickets: true
                        }
                    }
                }
            });
            const mappedProviders = providers.map((provider) => this.mapProviderFromPrisma(provider));
            const pagination = {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            };
            return {
                providers: mappedProviders,
                pagination
            };
        }
        catch (error) {
            console.error('Erro no ProviderRepository.list:', error);
            throw new Error(`Erro ao listar provedores: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Buscar provedor por ID
     */
    async findById(id) {
        try {
            const provider = await this.prisma.provider.findFirst({
                where: {
                    id
                    // Campo deletedAt removido do schema
                },
                include: {
                    providerUsers: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                    // Removendo status pois não existe no schema User
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            providerUsers: true,
                            equipments: true,
                            tickets: true
                        }
                    }
                }
            });
            return provider ? this.mapProviderFromPrisma(provider) : null;
        }
        catch (error) {
            console.error('Erro no ProviderRepository.findById:', error);
            throw new Error(`Erro ao buscar provedor por ID: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Buscar provedor por workspace
     */
    async findByWorkspace(workspace) {
        try {
            const provider = await this.prisma.provider.findFirst({
                where: {
                    workspace
                    // Campo deletedAt removido do schema
                },
                include: {
                    providerUsers: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                    // Removendo status pois não existe no schema User
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            providerUsers: true,
                            equipments: true,
                            tickets: true
                        }
                    }
                }
            });
            return provider ? this.mapProviderFromPrisma(provider) : null;
        }
        catch (error) {
            console.error('Erro no ProviderRepository.findByWorkspace:', error);
            throw new Error(`Erro ao buscar provedor por workspace: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Buscar provedor por CNPJ
     */
    async findByCnpj(cnpj) {
        try {
            const provider = await this.prisma.provider.findFirst({
                where: {
                    cnpj
                    // Campo deletedAt removido do schema
                },
                include: {
                    providerUsers: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                    // Removendo status pois não existe no schema User
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            providerUsers: true,
                            equipments: true,
                            tickets: true
                        }
                    }
                }
            });
            return provider ? this.mapProviderFromPrisma(provider) : null;
        }
        catch (error) {
            console.error('Erro no ProviderRepository.findByCnpj:', error);
            throw new Error(`Erro ao buscar provedor por CNPJ: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Atualizar provedor
     */
    async update(id, data) {
        try {
            const provider = await this.prisma.provider.update({
                where: { id },
                data: {
                    name: data.name,
                    cnpj: data.cnpj,
                    updatedAt: data.updatedAt
                },
                include: {
                    providerUsers: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                    // Removendo status pois não existe no schema User
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            providerUsers: true,
                            equipments: true,
                            tickets: true
                        }
                    }
                }
            });
            return this.mapProviderFromPrisma(provider);
        }
        catch (error) {
            console.error('Erro no ProviderRepository.update:', error);
            if (error.code === 'P2025') {
                return null; // Registro não encontrado
            }
            throw new Error(`Erro ao atualizar provedor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Excluir provedor (delete físico)
     */
    async delete(id, deletedBy) {
        try {
            await this.prisma.provider.delete({
                where: { id }
            });
            return true;
        }
        catch (error) {
            console.error('Erro no ProviderRepository.delete:', error);
            if (error.code === 'P2025') {
                return false; // Registro não encontrado
            }
            throw new Error(`Erro ao excluir provedor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Atualizar status do provedor (função removida - campo não existe no schema)
     */
    async updateStatus(id, status, updatedBy) {
        try {
            // Campo status não existe no schema - retornando o provider sem alteração
            const provider = await this.prisma.provider.findUnique({
                where: { id },
                include: {
                    providerUsers: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                    // Removendo status pois não existe no schema User
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            providerUsers: true,
                            equipments: true,
                            tickets: true
                        }
                    }
                }
            });
            return this.mapProviderFromPrisma(provider);
        }
        catch (error) {
            console.error('Erro no ProviderRepository.updateStatus:', error);
            if (error.code === 'P2025') {
                return null;
            }
            throw new Error(`Erro ao atualizar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Obter estatísticas do provedor
     */
    async getStats(providerId) {
        try {
            const [totalUsers, activeUsers, totalEquipment, activeEquipment, totalTickets, openTickets, closedTickets, totalCustomers] = await Promise.all([
                this.prisma.providerUser.count({
                    where: { providerId }
                }),
                this.prisma.providerUser.count({
                    where: {
                        providerId,
                        // Removendo filtro por status do user pois não existe no schema
                    }
                }),
                this.prisma.equipment.count({
                    where: { providerId }
                }),
                this.prisma.equipment.count({
                    where: {
                        providerId
                        // Removendo filtro por status pois não existe no schema
                    }
                }),
                this.prisma.ticket.count({
                    where: { providerId }
                }),
                this.prisma.ticket.count({
                    where: {
                        providerId,
                        status: { in: ['open', 'in_progress', 'waiting'] }
                    }
                }),
                this.prisma.ticket.count({
                    where: {
                        providerId,
                        status: 'closed'
                    }
                }),
                // Removendo contagem de customers pois não existe no schema
                Promise.resolve(0)
            ]);
            return {
                totalUsers: totalUsers,
                activeUsers: activeUsers,
                totalEquipments: totalEquipment,
                onlineEquipments: activeEquipment,
                totalTickets: totalTickets,
                openTickets: openTickets,
                resolvedTickets: closedTickets,
                averageResolutionTime: 0, // TODO: Calcular tempo médio de resolução
                storageUsed: 0, // TODO: Implementar cálculo de armazenamento
                apiCallsThisMonth: 0 // TODO: Implementar contagem de chamadas API
            };
        }
        catch (error) {
            console.error('Erro no ProviderRepository.getStats:', error);
            throw new Error(`Erro ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Criar convite para usuário
     */
    async createInvite(invite) {
        try {
            // TODO: Implementar tabela ProviderInvite no schema Prisma
            // Por enquanto, retornamos o convite com um ID simulado
            return {
                ...invite,
                id: Math.floor(Math.random() * 1000000).toString()
            };
        }
        catch (error) {
            console.error('Erro no ProviderRepository.createInvite:', error);
            throw new Error(`Erro ao criar convite: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Buscar usuário por email no provedor
     */
    async findUserByEmail(providerId, email) {
        try {
            const userProvider = await this.prisma.providerUser.findFirst({
                where: {
                    providerId,
                    user: { email }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                            // Removendo status pois não existe no schema User
                        }
                    }
                }
            });
            if (!userProvider) {
                return null;
            }
            return {
                id: userProvider.id,
                userId: userProvider.userId,
                providerId: userProvider.providerId,
                role: userProvider.role,
                permissions: userProvider.permissions || [],
                status: userProvider.isActive ? 'active' : 'inactive',
                user: userProvider.user
            };
        }
        catch (error) {
            console.error('Erro no ProviderRepository.findUserByEmail:', error);
            throw new Error(`Erro ao buscar usuário por email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Buscar convite pendente por token
     */
    async findPendingInvite(token) {
        try {
            // TODO: Implementar tabela ProviderInvite no schema Prisma
            // Por enquanto, retornamos null
            return null;
        }
        catch (error) {
            console.error('Erro no ProviderRepository.findPendingInvite:', error);
            throw new Error(`Erro ao buscar convite pendente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Listar usuários do provedor
     */
    async getUsers(providerId) {
        try {
            const userProviders = await this.prisma.providerUser.findMany({
                where: { providerId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                            // Removendo status pois não existe no schema User
                        }
                    }
                },
                orderBy: { joinedAt: 'desc' }
            });
            return userProviders.map((up) => ({
                id: up.id,
                userId: up.userId,
                providerId: up.providerId,
                role: up.role,
                permissions: up.permissions || [],
                status: up.isActive ? 'active' : 'inactive',
                user: up.user
            }));
        }
        catch (error) {
            console.error('Erro no ProviderRepository.getUsers:', error);
            throw new Error(`Erro ao listar usuários: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Atualizar configurações do provedor
     */
    async updateSettings(providerId, settings, updatedBy) {
        try {
            // Como o campo settings não existe mais no schema, 
            // esta funcionalidade precisa ser reimplementada ou removida
            throw new Error('Método updateSettings não implementado - campo settings removido do schema');
        }
        catch (error) {
            console.error('Erro no ProviderRepository.updateSettings:', error);
            throw new Error(`Erro ao atualizar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Verificar se usuário tem acesso ao provedor
     */
    async userHasAccess(userId, providerId) {
        try {
            // Acesso se for owner
            const provider = await this.prisma.provider.findFirst({
                where: { id: providerId, ownerId: userId }
            });
            if (provider)
                return true;
            // Acesso se for membro ativo do provedor
            const membership = await this.prisma.providerUser.findFirst({
                where: { providerId, userId, isActive: true }
            });
            return !!membership;
        }
        catch (error) {
            console.error('Erro no ProviderRepository.userHasAccess:', error);
            return false;
        }
    }
    /**
     * Obter vínculo do usuário com o provedor, incluindo permissões
     */
    async getProviderUser(userId, providerId) {
        try {
            const up = await this.prisma.providerUser.findFirst({
                where: { providerId, userId },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, role: true }
                    }
                }
            });
            if (!up)
                return null;
            return {
                id: up.id,
                userId: up.userId,
                providerId: up.providerId,
                role: up.role,
                permissions: up.permissions || [],
                status: up.isActive ? 'active' : 'inactive',
                user: up.user
            };
        }
        catch (error) {
            console.error('Erro no ProviderRepository.getProviderUser:', error);
            return null;
        }
    }
    /**
     * Criar vínculo do usuário com o provedor (ProviderUser)
     */
    async addProviderUser(providerId, userId, role = 'admin', permissions = []) {
        try {
            const up = await this.prisma.providerUser.create({
                data: {
                    providerId,
                    userId,
                    role,
                    permissions,
                    isActive: true,
                    joinedAt: new Date()
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, role: true }
                    }
                }
            });
            return {
                id: up.id,
                userId: up.userId,
                providerId: up.providerId,
                role: up.role,
                permissions: up.permissions || [],
                status: up.isActive ? 'active' : 'inactive',
                user: up.user
            };
        }
        catch (error) {
            console.error('Erro no ProviderRepository.addProviderUser:', error);
            throw new Error(`Erro ao criar vínculo usuário-provedor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Mapear dados do Prisma para o tipo Provider
     */
    mapProviderFromPrisma(prismaProvider) {
        return {
            id: prismaProvider.id,
            name: prismaProvider.name,
            cnpj: prismaProvider.cnpj,
            workspace: prismaProvider.workspace || '',
            email: '',
            phone: '',
            website: '',
            description: '',
            logo: '',
            address: {
                id: 1,
                street: '',
                number: '',
                complement: '',
                neighborhood: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'Brasil'
            },
            contactInfo: {
                primaryPhone: '',
                email: '',
                website: ''
            },
            plan: 'basic',
            status: 'active', // Campo padrão já que não existe no schema
            settings: {
                timezone: 'America/Sao_Paulo',
                language: 'pt-BR',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '24h',
                currency: 'BRL',
                ticketSettings: {},
                notificationSettings: {},
                securitySettings: {},
                integrationSettings: {}
            },
            createdAt: prismaProvider.createdAt,
            updatedAt: prismaProvider.updatedAt
        };
    }
}
exports.ProviderRepository = ProviderRepository;
