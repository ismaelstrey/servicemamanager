import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {  Button, Spinner, Alert } from '../../components/ui';
import KanbanBoard from '../../components/kanban/KanbanBoard';
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

      <KanbanBoard
        board={board}
        columnOrder={columnOrder}
        statusLabels={statusLabels}
        onItemClick={(id) => navigate(`/tickets/${id}`)}
        onDragEnd={async (itemId, from, to) => {
          try {
            // Mapeia colunas da UI para status do backend
            const mapToBackend = (s: string): string => {
              if (s === 'pending') return 'waiting_client';
              return s; // open, in_progress, waiting_client, resolved, closed
            };

            const fromBackend = mapToBackend(from);
            const toBackend = mapToBackend(to);

            // Ignora se status não mudou efetivamente
            if (fromBackend === toBackend) return;

            // Otimista: mover no board imediatamente
            setBoard((prev) => {
              const next = { ...prev } as any;
              const fromArr = [...(next[from] || [])];
              const toArr = [...(next[to] || [])];
              const idx = fromArr.findIndex((i: any) => i.id === itemId);
              if (idx >= 0) {
                const item = { ...fromArr[idx], updatedAt: new Date().toISOString() };
                fromArr.splice(idx, 1);
                toArr.unshift(item);
                next[from] = fromArr;
                next[to] = toArr;
              }
              return next;
            });

            // Chamada à API para atualizar status
            const res = await ApiService.put(`/tickets/${itemId}/status`, { status: toBackend });
            if (!res?.success) {
              throw new Error(res?.message || 'Falha ao atualizar status');
            }

            // Opcional: recarregar tablero para sincronizar com backend
            // Comentado para evitar excesso de chamadas; manter otimista
            // const url = providerId ? `/providers/${providerId}/tickets/kanban` : `/tickets/kanban`;
            // const fresh = await ApiService.get<KanbanBoard>(url);
            // setBoard({ ...fresh.data });
          } catch (e: any) {
            console.error('Erro ao atualizar status do ticket:', e);
            const api = e?.response?.data;
            const apiMessage = (api && typeof api === 'object' && api.message) ? api.message : undefined;
            const apiErrors = (api && typeof api === 'object' && Array.isArray(api.errors)) ? api.errors : [];
            const details = apiErrors
              .map((err: any) => err?.message || `${err?.field ?? ''} ${err?.code ? '(' + err.code + ')' : ''}`.trim())
              .filter(Boolean)
              .join('; ');
            const finalMsg = [apiMessage || 'Erro ao atualizar status do ticket', details].filter(Boolean).join(': ');
            setError(finalMsg);
            // Recarregar o board para desfazer otimista e refletir estado real
            try {
              const url = providerId ? `/providers/${providerId}/tickets/kanban` : `/tickets/kanban`;
              const fresh = await ApiService.get<KanbanBoard>(url);
              // Normalizar conforme carregamento inicial
              const normalized: KanbanBoard = { ...fresh.data };
              const completed: KanbanBoard = {} as KanbanBoard;
              for (const col of columnOrder) {
                completed[col] = (normalized[col] || []).map((item: any) => ({
                  id: item.id,
                  title: item.title ?? `Ticket #${item.id}`,
                  priority: (item.priority as any) ?? 'medium',
                  updatedAt: item.updatedAt ?? new Date().toISOString(),
                }));
              }
              setBoard(completed);
            } catch (reloadErr) {
              console.error('Falha ao recarregar Kanban após erro:', reloadErr);
            }
          }
        }}
      />
    </div>
  );
};

export default TicketsKanbanPage;