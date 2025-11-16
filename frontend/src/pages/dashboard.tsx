import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { StatsCard, RecentTickets, RecentServiceOrders, QuickActions, createQuickActions } from '../components/dashboard';
import { LogoLoader, Alert, ChartContainer, Toast } from '../components/ui';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import type { Ticket } from '../types/ticket';
import type { ServiceOrder } from '../types/serviceOrder';
import { useNavigate } from 'react-router-dom';
import DashboardService from '../services/dashboardService';
import ServiceOrderService from '../services/serviceOrderService';
import { ApiService, type PaginatedResponse } from '../services/api';
import ProviderService, { type ProviderListItem } from '../services/providerService';
import ServiceOrderStatusChart from '../components/dashboard/charts/ServiceOrderStatusChart';
import Timeline from '../components/dashboard/Timeline';
import { useProviderContext } from '../contexts/providerContext';

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
  const [, setProviders] = useState<ProviderListItem[]>([]);
  const { selectedProviderId } = useProviderContext();
  const [providersTotal, setProvidersTotal] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<Array<{ type: string; id: number; title: string; description?: string; createdAt: string | Date }>>([]);
  const [period, setPeriod] = useState<'7d' | '30d' | '3m' | '12m'>('30d');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  useEffect(() => {
    loadProvidersAndInit();
  }, []);



  const loadProvidersAndInit = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await ProviderService.listProviders({ limit: 50 });
      setProviders(list);

      // Buscar total de provedores usando paginação (limit=1 só para obter o meta)
      try {
        const providersMetaRes = await ApiService.get<{ success: boolean; data: ProviderListItem[]; pagination: { total: number } }>(`/providers?page=1&limit=1`);
        const total = (providersMetaRes as any)?.pagination?.total ?? list.length;
        setProvidersTotal(Number(total) || 0);
      } catch (metaErr) {
        console.warn('Falha ao obter total de provedores, usando tamanho da lista:', metaErr);
        setProvidersTotal(list.length);
      }

      await loadDashboardData(selectedProviderId === null ? 'global' : selectedProviderId);
    } catch (err) {
      setError('Erro ao carregar provedores');
      console.error('Providers loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (mode?: number | 'global') => {
    try {
      setLoading(true);
      setError(null);

      const effectiveMode: number | 'global' =
        typeof mode !== 'undefined'
          ? mode
          : (selectedProviderId ?? 'global');

      if (effectiveMode === 'global') {
        const [serviceOrderStats, serviceOrdersRes] = await Promise.all([
          ServiceOrderService.getServiceOrderStats(),
          ServiceOrderService.getServiceOrders({ page: 1, limit: 5 })
        ]);

        const newStats: DashboardStats = {
          totalTickets: 0,
          openTickets: 0,
          totalServiceOrders: (serviceOrderStats as any)?.total ?? 0,
          pendingServiceOrders: (serviceOrderStats as any)?.pending ?? (serviceOrderStats as any)?.byStatus?.pending ?? 0,
          completedThisMonth: (serviceOrderStats as any)?.completed ?? (serviceOrderStats as any)?.byStatus?.completed ?? 0,
          revenue: (serviceOrderStats as any)?.totalRevenue ?? 0,
          customerSatisfaction: 0,
          averageResolutionTime: (serviceOrderStats as any)?.averageCompletionTime ?? 0,
        };

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
        setRecentTickets([]);
        setRecentServiceOrders(mappedServiceOrders);
        setRecentActivities([]);
      } else {
        const providerId = effectiveMode as number;
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
        setRecentActivities(dashboardData.recentActivities ?? []);
      }
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const mode = selectedProviderId === null ? 'global' : selectedProviderId;
    loadDashboardData(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProviderId]);

  const quickActions = createQuickActions({
    onCreateTicket: () => navigate('/tickets/new'),
    onCreateServiceOrder: () => navigate('/service-orders/new'),
    onViewReports: () => navigate('/reports'),
    onManageUsers: () => navigate('/users'),
    onViewSettings: () => navigate('/settings'),
    onViewHelp: () => navigate('/help'),
  });

  // Polling simples para notificações de novas atividades (somente modo provedor)
  useEffect(() => {
    if (selectedProviderId === null) return;
    const providerId = selectedProviderId as number;
    const id = window.setInterval(async () => {
      try {
        const data = await DashboardService.getDashboard(providerId);
        if ((data.recentActivities?.length || 0) > (recentActivities?.length || 0)) {
          setToastMsg('Nova atividade registrada no provedor');
          setToastOpen(true);
          setRecentActivities(data.recentActivities);
        }
      } catch (e) {
        // silencioso
      }
    }, 15000);
    return () => window.clearInterval(id);
  }, [selectedProviderId, recentActivities]);

  const exportCsv = () => {
    try {
      const lines: string[] = [];
      lines.push('Secao,Campo,Valor');
      if (stats) {
        lines.push(`Resumo,totalTickets,${stats.totalTickets}`);
        lines.push(`Resumo,openTickets,${stats.openTickets}`);
        lines.push(`Resumo,totalServiceOrders,${stats.totalServiceOrders}`);
        lines.push(`Resumo,pendingServiceOrders,${stats.pendingServiceOrders}`);
        lines.push(`Resumo,completedThisMonth,${stats.completedThisMonth}`);
        lines.push(`Resumo,revenue,${stats.revenue}`);
        lines.push(`Resumo,customerSatisfaction,${stats.customerSatisfaction}`);
        lines.push(`Resumo,averageResolutionTime,${stats.averageResolutionTime}`);
      }
      lines.push('');
      lines.push('TicketsRecentes,id,title,status,priority,createdAt');
      recentTickets.forEach(t => {
        lines.push(`${t.id},"${t.title}",${t.status},${t.priority},${new Date(t.createdAt).toISOString()}`);
      });
      lines.push('');
      lines.push('OSRecentes,id,title,status,priority,createdAt');
      recentServiceOrders.forEach(so => {
        lines.push(`${so.id},"${so.title}",${so.status},${so.priority},${new Date(so.createdAt).toISOString()}`);
      });

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-relatorio-${period}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setToastMsg('Falha ao exportar CSV');
      setToastOpen(true);
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleServiceOrderClick = (serviceOrder: ServiceOrder) => {
    navigate(`/service-orders/${serviceOrder.id}`);
  };

  if (loading) {
    return <LogoLoader fullscreen message="Carregando dashboard..." />;
  }

  // Visão global está sempre disponível — não há estado de provedor ausente aqui.

  if (error) {
    return (
      <ErrorWrap>
        <Alert variant="error" title="Erro no Dashboard">
          {error}
        </Alert>
      </ErrorWrap>
    );
  }

  return (
    <MotionContainer initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageWrap>
        <DashboardHeader
        title={`Bem-vindo, ${user?.name || 'Usuário'}!`}
        subtitle="Aqui está um resumo das suas atividades recentes"
        period={period as '7d' | '30d' | '3m' | '12m'}
        onPeriodChange={(value) => setPeriod(value as any)}
        onExportCsv={() => exportCsv()}
        onCreateProvider={() => navigate('/providers/create')}
        />

        {stats && (
          <StatsGrid>
          {selectedProviderId !== null && (
            <>
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
            </>
          )}

          <StatsCard
            title="Total de Provedores"
            value={providersTotal}
            subtitle="Registrados"
            icon="🏢"
            color="primary"
            onClick={() => navigate('/providers')}
            tooltip="Clique para ver provedores"
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
          </StatsGrid>
        )}

        <ContentGrid>
          <MainCol>
            {stats && (
              <Section>
                <ChartContainer title={`Status de OS (${period})`}>
                  <ServiceOrderStatusChart stats={{
                    pending: (stats as any).pendingServiceOrders ?? 0,
                    inProgress: (stats as any).inProgress ?? ((stats as any).totalServiceOrders - (stats as any).pendingServiceOrders - (stats as any).completedThisMonth),
                    completed: (stats as any).completedThisMonth ?? 0,
                    cancelled: (stats as any).cancelled ?? 0,
                  }} />
                </ChartContainer>
              </Section>
            )}
            {selectedProviderId !== null && (
              <RecentTickets
                tickets={recentTickets}
                onViewAll={() => navigate('/tickets')}
                onTicketClick={handleTicketClick}
              />
            )}

            <RecentServiceOrders
              serviceOrders={recentServiceOrders}
              onViewAll={() => navigate('/service-orders')}
              onServiceOrderClick={handleServiceOrderClick}
            />

            {selectedProviderId !== null && (
              <Section>
                <ChartContainer title="Atividades Recentes">
                  <Timeline items={recentActivities.map((a) => ({
                    type: a.type,
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    createdAt: a.createdAt,
                  }))} onItemClick={(it) => {
                    if (it.type === 'ticket') navigate(`/tickets/${it.id}`);
                  }} />
                </ChartContainer>
              </Section>
            )}
          </MainCol>

          <SidebarCol>
            <QuickActions actions={quickActions} />
          </SidebarCol>
        </ContentGrid>

        <Toast
          open={toastOpen}
          onClose={() => setToastOpen(false)}
          title="Notificação"
          description={toastMsg}
          variant="info"
        />
      </PageWrap>
    </MotionContainer>
  );
}

export default DashboardPage;

const MotionContainer = styled(motion.div)`
  width: 100%;
`;

const PageWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ErrorWrap = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MainCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SidebarCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Section = styled.div`
  margin: ${({ theme }) => theme.spacing.xs} 0;
`;
