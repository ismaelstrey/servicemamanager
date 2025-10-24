import React, { useState, useEffect } from 'react';
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

      // Simulate API calls - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data - replace with actual API responses
      const mockStats: DashboardStats = {
        totalTickets: 1247,
        openTickets: 89,
        totalServiceOrders: 456,
        pendingServiceOrders: 23,
        completedThisMonth: 156,
        revenue: 125000,
        customerSatisfaction: 4.8,
        averageResolutionTime: 2.5,
      };

      const mockTickets: Ticket[] = [
        {
          id: '1',
          number: 'TK-2024-001',
          title: 'Problema na conexão de internet',
          description: 'Cliente relatando instabilidade na conexão',
          status: 'open',
          priority: 'high',
          category: 'technical',
          source: 'phone',
          customerInfo: {
            name: 'João Silva',
            email: 'joao@email.com',
            phone: '(11) 99999-9999',
            company: 'Empresa ABC',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedTo: {
            id: '1',
            name: 'Maria Santos',
            email: 'maria@telecom.com',
          },
          comments: [],
          attachments: [],
          history: [],
        },
        {
          id: '2',
          number: 'TK-2024-002',
          title: 'Solicitação de upgrade de plano',
          description: 'Cliente deseja fazer upgrade para plano premium',
          status: 'in_progress',
          priority: 'medium',
          category: 'billing',
          source: 'email',
          customerInfo: {
            name: 'Ana Costa',
            email: 'ana@email.com',
            phone: '(11) 88888-8888',
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          comments: [],
          attachments: [],
          history: [],
        },
      ];

      const mockServiceOrders: ServiceOrder[] = [
        {
          id: '1',
          number: 'OS-2024-001',
          title: 'Instalação de fibra óptica',
          description: 'Instalação de nova conexão de fibra óptica residencial',
          status: 'scheduled',
          priority: 'high',
          type: 'installation',
          category: 'fiber',
          customerInfo: {
            name: 'Pedro Oliveira',
            email: 'pedro@email.com',
            phone: '(11) 77777-7777',
            company: 'Residencial',
          },
          location: {
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
            coordinates: {
              latitude: -23.5505,
              longitude: -46.6333,
            },
          },
          scheduledDate: new Date(Date.now() + 86400000).toISOString(),
          estimatedCost: 299.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedTechnician: {
            id: '1',
            name: 'Carlos Técnico',
            email: 'carlos@telecom.com',
          },
          tasks: [],
          materials: [],
          comments: [],
          attachments: [],
          history: [],
        },
      ];

      setStats(mockStats);
      setRecentTickets(mockTickets);
      setRecentServiceOrders(mockServiceOrders);
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