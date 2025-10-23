"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const providerService_1 = require("./providerService");
const equipmentRepository_1 = require("../repositories/equipmentRepository");
const ticketRepository_1 = require("../repositories/ticketRepository");
const passwordVaultRepository_1 = require("../repositories/passwordVaultRepository");
class DashboardService {
    constructor() {
        this.providerService = new providerService_1.ProviderService();
        this.equipmentRepository = new equipmentRepository_1.EquipmentRepository();
        this.ticketRepository = new ticketRepository_1.TicketRepository();
        this.passwordVaultRepository = new passwordVaultRepository_1.PasswordVaultRepository();
    }
    async getDashboard(providerId, user) {
        try {
            // Verificar se o provider existe
            const provider = await this.providerService.findById(providerId, user);
            if (!provider) {
                throw new Error('Provider não encontrado');
            }
            // Obter estatísticas
            const [equipmentStats, ticketStats, passwordStats] = await Promise.all([
                this.equipmentRepository.getStatsByProvider(providerId),
                this.ticketRepository.getStatsByProvider(providerId),
                this.passwordVaultRepository.getStatsByProvider(providerId)
            ]);
            // Calcular overview
            const overview = {
                totalEquipments: equipmentStats.total,
                totalTickets: ticketStats.total,
                totalPasswords: passwordStats.total,
                openTickets: ticketStats.byStatus.open || 0,
                criticalTickets: ticketStats.byPriority.critical || 0,
                activeEquipments: Object.entries(equipmentStats.byType).reduce((acc, [type, count]) => acc + count, 0)
            };
            // Obter atividades recentes (últimos 10 tickets criados)
            const recentTickets = await this.ticketRepository.listByProvider(providerId, {
                page: 1,
                limit: 10
            });
            const recentActivities = recentTickets.tickets.map(ticket => ({
                type: 'ticket',
                id: ticket.id,
                title: ticket.title,
                description: ticket.description,
                createdAt: ticket.createdAt
            }));
            return {
                overview,
                recentActivities
            };
        }
        catch (error) {
            console.error('Erro no DashboardService.getDashboard:', error);
            throw new Error(`Erro ao obter dados do dashboard: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async getEquipmentStats(providerId, user) {
        try {
            // Verificar se o provider existe
            const provider = await this.providerService.findById(providerId, user);
            if (!provider) {
                throw new Error('Provider não encontrado');
            }
            const stats = await this.equipmentRepository.getStatsByProvider(providerId);
            return {
                total: stats.total,
                byType: stats.byType,
                byStatus: {} // Equipment repository doesn't have byStatus yet
            };
        }
        catch (error) {
            console.error('Erro no DashboardService.getEquipmentStats:', error);
            throw new Error(`Erro ao obter estatísticas de equipamentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async getTicketStats(providerId, user) {
        try {
            // Verificar se o provider existe
            const provider = await this.providerService.findById(providerId, user);
            if (!provider) {
                throw new Error('Provider não encontrado');
            }
            const stats = await this.ticketRepository.getStatsByProvider(providerId);
            return {
                total: stats.total,
                byStatus: stats.byStatus,
                byPriority: stats.byPriority
            };
        }
        catch (error) {
            console.error('Erro no DashboardService.getTicketStats:', error);
            throw new Error(`Erro ao obter estatísticas de tickets: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async getPasswordStats(providerId, user) {
        try {
            // Verificar se o provider existe
            const provider = await this.providerService.findById(providerId, user);
            if (!provider) {
                throw new Error('Provider não encontrado');
            }
            const stats = await this.passwordVaultRepository.getStatsByProvider(providerId);
            return {
                total: stats.total
            };
        }
        catch (error) {
            console.error('Erro no DashboardService.getPasswordStats:', error);
            throw new Error(`Erro ao obter estatísticas de senhas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
}
exports.DashboardService = DashboardService;
