import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card, Spinner, Alert, Badge, Heading } from '../../components/ui';
import ServiceOrderService from '../../services/serviceOrderService';

interface ServiceOrderStatsBackend {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  averageCompletionTime?: number;
  totalRevenue?: number;
  pendingRevenue?: number;
}

// Página de Relatórios de SLA e métricas de OS
const ServiceOrdersReportsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ServiceOrderStatsBackend | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res: any = await ServiceOrderService.getServiceOrderStats();
        const normalized: ServiceOrderStatsBackend = {
          total: res.total ?? 0,
          byStatus: res.byStatus ?? {
            pending: res.pending ?? 0,
            in_progress: res.inProgress ?? 0,
            completed: res.completed ?? 0,
            cancelled: res.cancelled ?? 0,
          },
          byPriority: res.byPriority ?? {},
          averageCompletionTime: res.averageCompletionTime ?? 0,
          totalRevenue: res.totalRevenue ?? 0,
          pendingRevenue: res.pendingRevenue ?? 0,
        };
        setStats(normalized);
      } catch (e) {
        setError('Erro ao carregar relatórios de OS.');
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    in_progress: 'Em Andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Page>
      <Heading level={1}>Relatórios de SLA e Métricas de OS</Heading>

      {error && (
        <Alert variant="error" title="Erro" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        {isLoading ? (
          <LoadingContainer>
            <Spinner />
            <p>Carregando relatórios...</p>
          </LoadingContainer>
        ) : stats ? (
          <ContentGrid>
            <Card>
              <Heading level={3}>Resumo</Heading>
              <SummaryGrid>
                <div><strong>Total de OS:</strong> {stats.total}</div>
                <div><strong>Tempo médio de conclusão:</strong> {stats.averageCompletionTime} h</div>
                <div><strong>Receita total:</strong> R$ {Number(stats.totalRevenue).toFixed(2)}</div>
                <div><strong>Receita pendente:</strong> R$ {Number(stats.pendingRevenue).toFixed(2)}</div>
              </SummaryGrid>
            </Card>

            <Card>
              <Heading level={3}>Por Status</Heading>
              <ListCol>
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <StatusRow key={status}>
                    <Badge variant={getStatusVariant(status)}>{statusLabels[status] ?? status}</Badge>
                    <BarTrack>
                      <BarFill $pct={stats.total ? (count / stats.total) * 100 : 0} />
                    </BarTrack>
                    <span>{count}</span>
                  </StatusRow>
                ))}
              </ListCol>
            </Card>

            <FullWidth>
              <Card>
                <Heading level={3}>Por Prioridade</Heading>
                <ListCol>
                  {Object.entries(stats.byPriority).map(([priority, count]) => (
                    <PriorityRow key={priority}>
                      <Badge variant="secondary">{priority}</Badge>
                      <BarTrack>
                        <BarFill $pct={stats.total ? (count / stats.total) * 100 : 0} $secondary />
                      </BarTrack>
                      <span>{count}</span>
                    </PriorityRow>
                  ))}
                </ListCol>
              </Card>
            </FullWidth>
          </ContentGrid>
        ) : (
          <EmptyState>
            <p>Nenhuma informação disponível.</p>
          </EmptyState>
        )}
      </Card>
    </Page>
  );
};

export default ServiceOrdersReportsPage;

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xs};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ListCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PriorityRow = styled(StatusRow)``;

const BarTrack = styled.div`
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: var(--color-border);
`;

const BarFill = styled.div<{ $pct: number; $secondary?: boolean }>`
  width: ${({ $pct }) => `${$pct}%`};
  height: 8px;
  border-radius: 4px;
  background: ${({ $secondary }) => $secondary ? 'var(--color-secondary)' : 'var(--color-primary)'};
`;

const FullWidth = styled.div`
  grid-column: 1 / span 2;

  @media (max-width: 768px) {
    grid-column: auto;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
`;