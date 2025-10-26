import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/dashboard/StatsCard';
import RecentTickets from '../components/dashboard/RecentTickets';
import RecentServiceOrders from '../components/dashboard/RecentServiceOrders';
import QuickActions from '../components/dashboard/QuickActions';
import { createQuickActions } from '../utils/quickActions';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import type { Ticket } from '../types/ticket';
import type { ServiceOrder } from '../types/serviceOrder';
import { useNavigate } from 'react-router-dom';
import DashboardService from '../services/dashboardService';
import ServiceOrderService from '../services/serviceOrderService';
import { ApiService, type PaginatedResponse } from '../services/api';
import { decodeJwt } from '../utils/jwt';

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  totalServiceOrders: number;
  pendingServiceOrders: number;
  completedThisMonth: number;
  revenue: number;
  customerSatisfaction: number;
  averageResolutionTime: number;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [recentServiceOrders, setRecentServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const payload = decodeJwt(token ?? undefined);
      const providerId = (user as any)?.providerId ?? payload?.providerId;
  
      if (!providerId) {
        setError('ProviderId não encontrado no usuário ou token.');
        return;
      }
  
      const [dashboardData, serviceOrderStats, ticketsRes, serviceOrdersRes] = await Promise.all([
        DashboardService.getDashboard(providerId),
        ServiceOrderService.getServiceOrderStats(),
        ApiService.get<PaginatedResponse<any>>(`/providers/${providerId}/tickets?page=1&limit=5`),
        ServiceOrderService.getServiceOrders({ page: 1, limit: 5 })
      ]);
  
      const newStats: DashboardStats = {
        totalTickets: dashboardData.overview.totalTickets,
        openTickets: dashboardData.overview.openTickets,
        totalServiceOrders: (serviceOrderStats as any)?.total ?? 0,
        pendingServiceOrders: (serviceOrderStats as any)?.pending ?? (serviceOrderStats as any)?.byStatus?.pending ?? 0,
        completedThisMonth: (serviceOrderStats as any)?.completed ?? (serviceOrderStats as any)?.byStatus?.completed ?? 0,
        revenue: (serviceOrderStats as any)?.totalRevenue ?? 0,
        customerSatisfaction: 0,
        averageResolutionTime: (serviceOrderStats as any)?.averageCompletionTime ?? 0,
      };
  
      const recentTicketsData = (ticketsRes.data?.data ?? []);
      const mappedTickets: Ticket[] = recentTicketsData.map((t: any) => ({
        id: t.id,
        providerId: t.providerId,
        number: String(t.id),
        title: t.title,
        description: t.description,
        status: t.status === 'waiting_client' ? 'pending' : t.status,
        priority: t.priority,
        category: 'other',
        source: typeof t.source === 'string' ? (t.source === 'manual' ? 'web' : t.source) : 'web',
        customerInfo: { name: '', email: '' },
        comments: [],
        attachments: [],
        history: [],
        tags: [],
        slaStatus: t.slaStatus ?? 'within_sla',
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }));
  
      const recentServiceOrdersData = (serviceOrdersRes.data ?? []);
      const mappedServiceOrders: ServiceOrder[] = recentServiceOrdersData.map((so: any) => ({
        id: so.id,
        providerId: so.providerId ?? 0,
        number: String(so.id),
        title: so.title,
        description: so.description,
        status: so.status,
        priority: so.priority,
        type: 'maintenance',
        category: 'support',
        customerInfo: { name: '', email: '' },
        tasks: [],
        comments: [],
        attachments: [],
        history: [],
        tags: [],
        createdAt: new Date(so.createdAt),
        updatedAt: new Date(so.updatedAt),
      }));
  
      setStats(newStats);
      setRecentTickets(mappedTickets);
      setRecentServiceOrders(mappedServiceOrders);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = createQuickActions({
    onCreateTicket: () => navigate('/tickets/new'),
    onCreateServiceOrder: () => navigate('/service-orders/new'),
    onViewReports: () => navigate('/reports'),
    onManageUsers: () => navigate('/users'),
    onViewSettings: () => navigate('/settings'),
    onViewHelp: () => navigate('/help'),
  });

  const handleTicketClick = (ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleServiceOrderClick = (serviceOrder: ServiceOrder) => {
    navigate(`/service-orders/${serviceOrder.id}`);
  };

  if (loading) {
    return (
      <div className="dashboard dashboard--loading">
        <Spinner size="lg" centered label="Carregando dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard dashboard--error">
        <Alert variant="danger" title="Erro no Dashboard">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">
          Bem-vindo, {user?.name || 'Usuário'}!
        </h1>
        <p className="dashboard__subtitle">
          Aqui está um resumo das suas atividades recentes
        </p>
      </div>

      {stats && (
        <div className="dashboard__stats">
          <StatsCard
            title="Total de Tickets"
            value={stats.totalTickets}
            subtitle="Todos os tickets"
            icon="🎫"
            color="primary"
            onClick={() => navigate('/tickets')}
          />
          
          <StatsCard
            title="Tickets Abertos"
            value={stats.openTickets}
            subtitle="Aguardando atendimento"
            icon="🔓"
            color="warning"
            trend={{
              value: 12,
              label: 'vs. mês anterior',
              isPositive: false,
            }}
            onClick={() => navigate('/tickets?status=open')}
          />
          
          <StatsCard
            title="Ordens de Serviço"
            value={stats.totalServiceOrders}
            subtitle="Total de OS"
            icon="🔧"
            color="success"
            onClick={() => navigate('/service-orders')}
          />
          
          <StatsCard
            title="OS Pendentes"
            value={stats.pendingServiceOrders}
            subtitle="Aguardando execução"
            icon="⏳"
            color="danger"
            trend={{
              value: 8,
              label: 'vs. semana anterior',
              isPositive: true,
            }}
            onClick={() => navigate('/service-orders?status=pending')}
          />
          
          <StatsCard
            title="Concluídos este Mês"
            value={stats.completedThisMonth}
            subtitle="Tickets + OS"
            icon="✅"
            color="success"
            trend={{
              value: 15,
              label: 'vs. mês anterior',
              isPositive: true,
            }}
          />
          
          <StatsCard
            title="Receita"
            value={`R$ ${stats.revenue.toLocaleString('pt-BR')}`}
            subtitle="Este mês"
            icon="💰"
            color="info"
            trend={{
              value: 23,
              label: 'vs. mês anterior',
              isPositive: true,
            }}
          />
          
          <StatsCard
            title="Satisfação do Cliente"
            value={`${stats.customerSatisfaction}/5`}
            subtitle="Avaliação média"
            icon="⭐"
            color="success"
            trend={{
              value: 5,
              label: 'vs. mês anterior',
              isPositive: true,
            }}
          />
          
          <StatsCard
            title="Tempo Médio de Resolução"
            value={`${stats.averageResolutionTime}h`}
            subtitle="Para tickets"
            icon="⏱️"
            color="info"
            trend={{
              value: 18,
              label: 'vs. mês anterior',
              isPositive: true,
            }}
          />
        </div>
      )}

      <div className="dashboard__content">
        <div className="dashboard__main">
          <RecentTickets
            tickets={recentTickets}
            onViewAll={() => navigate('/tickets')}
            onTicketClick={handleTicketClick}
          />
          
          <RecentServiceOrders
            serviceOrders={recentServiceOrders}
            onViewAll={() => navigate('/service-orders')}
            onServiceOrderClick={handleServiceOrderClick}
          />
        </div>

        <div className="dashboard__sidebar">
          <QuickActions actions={quickActions} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;