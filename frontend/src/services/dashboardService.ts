import { ApiService } from './api';

export interface DashboardOverview {
  totalEquipments: number;
  totalTickets: number;
  totalPasswords: number;
  openTickets: number;
  criticalTickets: number;
  activeEquipments: number;
}

export interface RecentActivity {
  type: 'ticket' | 'equipment' | 'password';
  id: number;
  title: string;
  description?: string;
  createdAt: string | Date;
}

export interface DashboardData {
  overview: DashboardOverview;
  recentActivities: RecentActivity[];
}

export interface TicketStatsDetailed {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

export default class DashboardService {
  static async getDashboard(providerId: number): Promise<DashboardData> {
    const res = await ApiService.get<DashboardData>(`/dashboard/${providerId}`);
    return res.data;
  }

  static async getTicketStats(providerId: number): Promise<TicketStatsDetailed> {
    const res = await ApiService.get<TicketStatsDetailed>(`/dashboard/${providerId}/ticket-stats`);
    return res.data;
  }
}