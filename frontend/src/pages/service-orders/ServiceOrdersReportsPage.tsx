import React, { useEffect, useState } from 'react';
import { Card, Spinner, Alert, Badge } from '../../components/ui';
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
    <div className="service-orders-page" style={{ padding: '1rem' }}>
      <h1>Relatórios de SLA e Métricas de OS</h1>

      {error && (
        <Alert variant="danger" title="Erro" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        {isLoading ? (
          <div className="loading-container">
            <Spinner />
            <p>Carregando relatórios...</p>
          </div>
        ) : stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Card>
              <h3>Resumo</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><strong>Total de OS:</strong> {stats.total}</div>
                <div><strong>Tempo médio de conclusão:</strong> {stats.averageCompletionTime} h</div>
                <div><strong>Receita total:</strong> R$ {Number(stats.totalRevenue).toFixed(2)}</div>
                <div><strong>Receita pendente:</strong> R$ {Number(stats.pendingRevenue).toFixed(2)}</div>
              </div>
            </Card>

            <Card>
              <h3>Por Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant={getStatusVariant(status)}>{statusLabels[status] ?? status}</Badge>
                    <div style={{ flex: 1, background: 'var(--color-border)', height: '8px', borderRadius: '4px' }}>
                      <div style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%`, background: 'var(--color-primary)', height: '8px', borderRadius: '4px' }} />
                    </div>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div style={{ gridColumn: '1 / span 2' }}>
              <Card>
                <h3>Por Prioridade</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(stats.byPriority).map(([priority, count]) => (
                    <div key={priority} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Badge variant="secondary">{priority}</Badge>
                      <div style={{ flex: 1, background: 'var(--color-border)', height: '8px', borderRadius: '4px' }}>
                        <div style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%`, background: 'var(--color-secondary)', height: '8px', borderRadius: '4px' }} />
                      </div>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Nenhuma informação disponível.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ServiceOrdersReportsPage;