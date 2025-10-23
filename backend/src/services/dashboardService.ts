import { ProviderService } from './providerService';
import { EquipmentRepository } from '../repositories/equipmentRepository';
import { TicketRepository } from '../repositories/ticketRepository';
import { PasswordVaultRepository } from '../repositories/passwordVaultRepository';

export interface DashboardOverview {
  totalEquipments: number;
  totalTickets: number;
  totalPasswords: number;
  openTickets: number;
  criticalTickets: number;
  activeEquipments: number;
}

export interface EquipmentStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface TicketStatsDetailed {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface PasswordStats {
  total: number;
}

export interface RecentActivity {
  type: 'ticket' | 'equipment' | 'password';
  id: number;
  title: string;
  description?: string;
  createdAt: Date;
}

export interface DashboardData {
  overview: DashboardOverview;
  recentActivities: RecentActivity[];
}

export class DashboardService {
  private providerService: ProviderService;
  private equipmentRepository: EquipmentRepository;
  private ticketRepository: TicketRepository;
  private passwordVaultRepository: PasswordVaultRepository;

  constructor() {
    this.providerService = new ProviderService();
    this.equipmentRepository = new EquipmentRepository();
    this.ticketRepository = new TicketRepository();
    this.passwordVaultRepository = new PasswordVaultRepository();
  }

  async getDashboard(providerId: number, user: any): Promise<DashboardData> {
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
      const overview: DashboardOverview = {
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

      const recentActivities: RecentActivity[] = recentTickets.tickets.map(ticket => ({
        type: 'ticket' as const,
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        createdAt: ticket.createdAt
      }));

      return {
        overview,
        recentActivities
      };
    } catch (error) {
      console.error('Erro no DashboardService.getDashboard:', error);
      throw new Error(`Erro ao obter dados do dashboard: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getEquipmentStats(providerId: number, user: any): Promise<EquipmentStats> {
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
    } catch (error) {
      console.error('Erro no DashboardService.getEquipmentStats:', error);
      throw new Error(`Erro ao obter estatísticas de equipamentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getTicketStats(providerId: number, user: any): Promise<TicketStatsDetailed> {
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
    } catch (error) {
      console.error('Erro no DashboardService.getTicketStats:', error);
      throw new Error(`Erro ao obter estatísticas de tickets: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getPasswordStats(providerId: number, user: any): Promise<PasswordStats> {
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
    } catch (error) {
      console.error('Erro no DashboardService.getPasswordStats:', error);
      throw new Error(`Erro ao obter estatísticas de senhas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}