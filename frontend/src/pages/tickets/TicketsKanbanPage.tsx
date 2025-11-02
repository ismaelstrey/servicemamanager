import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardBody, Badge, Button, Spinner, Alert } from '../../components/ui';
import { ApiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

type KanbanBoard = Record<string, { id: number; title: string; priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'; updatedAt: string | Date }[]>;

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  assigned: 'Atribuído',
  in_progress: 'Em Andamento',
  pending: 'Pendente',
  waiting_client: 'Aguardando Cliente',
  resolved: 'Resolvido',
  closed: 'Fechado',
  cancelled: 'Cancelado',
};

const getPriorityVariant = (p: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' => {
  switch (p) {
    case 'low': return 'success';
    case 'medium': return 'info';
    case 'high': return 'warning';
    case 'urgent':
    case 'critical': return 'danger';
    default: return 'secondary';
  }
};

const columnOrder = ['open', 'assigned', 'in_progress', 'pending', 'waiting_client', 'resolved', 'closed'];

const TicketsKanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [board, setBoard] = useState<KanbanBoard>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const providerId = useMemo(() => {
    const fromQuery = searchParams.get('provider');
    if (fromQuery) return parseInt(fromQuery);
    return user?.providerId ?? undefined;
  }, [searchParams, user?.providerId]);

  useEffect(() => {
    const loadBoard = async () => {
      if (!providerId) {
        setError('Selecione um provedor (?provider=ID) para visualizar o Kanban.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await ApiService.get<{ success: boolean; data: KanbanBoard }>(`/providers/${providerId}/tickets/kanban`);
        const data = res.data?.data || {};
        // Normaliza waiting_client -> pending para alinhar com o frontend
        if (data['waiting_client'] && !data['pending']) {
          data['pending'] = data['waiting_client'];
        }
        setBoard(data);
      } catch (e) {
        console.error('Erro ao carregar Kanban:', e);
        setError('Erro ao carregar o Kanban de tickets.');
      } finally {
        setLoading(false);
      }
    };
    loadBoard();
  }, [providerId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" label="Carregando Kanban..." />
      </div>
    );
  }

  return (
    <div className="tickets-kanban">
      <div className="tickets-kanban__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Kanban de Tickets</h1>
          {providerId && <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Provider #{providerId}</p>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => navigate('/tickets')}>Voltar para Lista</Button>
          <Button variant="primary" onClick={() => navigate('/tickets/new')}>Novo Ticket</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Erro">{error}</Alert>
      )}

      <div className="tickets-kanban__board" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {columnOrder.filter(col => board[col] && board[col].length >= 0).map((col) => (
          <Card key={col}>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong>{statusLabels[col] || col}</strong>
                <Badge variant="secondary">{board[col]?.length || 0}</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(board[col] || []).map(item => (
                  <div key={item.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.75rem', background: 'var(--color-surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{item.title}</span>
                      <Badge variant={getPriorityVariant(String(item.priority))}>{String(item.priority)}</Badge>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Atualizado em {new Date(item.updatedAt).toLocaleString('pt-BR')}
                    </div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/tickets/${item.id}`)}>Abrir</Button>
                    </div>
                  </div>
                ))}
                {(board[col]?.length || 0) === 0 && (
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Sem itens</div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TicketsKanbanPage;