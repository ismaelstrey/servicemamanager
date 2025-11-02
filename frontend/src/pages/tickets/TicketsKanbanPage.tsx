import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardBody, Badge, Button, Spinner, Alert } from '../../components/ui';
import { ApiService } from '../../services/api';

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

// Ordem das colunas no board; inclui "cancelled" para refletir o backend
const columnOrder = ['open', 'assigned', 'in_progress', 'pending', 'waiting_client', 'resolved', 'closed', 'cancelled'];

const TicketsKanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [board, setBoard] = useState<KanbanBoard>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const providerId = useMemo(() => {
    const fromQuery = searchParams.get('provider');
    if (fromQuery) return parseInt(fromQuery);
    // Por padrão, usar visão global (sem provider) para alinhar com /api/tickets/kanban
    return undefined;
  }, [searchParams]);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = providerId
          ? `/providers/${providerId}/tickets/kanban`
          : `/tickets/kanban`;
        const res = await ApiService.get<KanbanBoard>(url);

        console.log('response:', res);
        const raw = res.data || {};
        console.log('raw:', raw);
        // Normalização: manter as chaves por status como vierem da API
        const normalized: KanbanBoard = { ...raw };

        // Garantir todas as colunas do columnOrder existem (arrays vazios por padrão)
        const completed: KanbanBoard = {} as KanbanBoard;
        for (const col of columnOrder) {
          completed[col] = (normalized[col] || []).map((item) => ({
            id: item.id,
            title: item.title ?? `Ticket #${item.id}`,
            priority: (item.priority as any) ?? 'medium',
            updatedAt: item.updatedAt ?? new Date().toISOString(),
          }));
        }

        setBoard(completed);
      } catch (e: any) {
        console.error('Erro ao carregar Kanban:', e);
        const status = e?.response?.status;
        if (status === 401) {
          setError('Não autenticado. Faça login para acessar o Kanban.');
        } else if (status === 403) {
          setError('Acesso negado. Você não possui permissão para ver este Kanban.');
        } else {
          setError('Erro ao carregar o Kanban de tickets.');
        }
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

  console.log('Board:', board);

  return (
    <div className="tickets-kanban">
      <div className="tickets-kanban__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Kanban de Tickets</h1>
          {providerId ? (
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Provider #{providerId}</p>
          ) : (
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Todos os provedores</p>
          )}
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