import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {  Button, Spinner, Toast } from '../../components/ui';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { ApiService } from '../../services/api';

type KanbanBoard = Record<string, { id: number; title: string; priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'; updatedAt: string | Date }[]>;

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  waiting_client: 'Aguardando Cliente',
  resolved: 'Resolvido',
  closed: 'Fechado',
};



// Ordem das colunas no board (somente statuses válidos do backend)
const columnOrder = ['open', 'in_progress', 'waiting_client', 'resolved', 'closed'];

const TicketsKanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [board, setBoard] = useState<KanbanBoard>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVariant, setToastVariant] = useState<'info' | 'success' | 'warning' | 'error'>('info');

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

      {/* Erro sutil será mostrado dentro do próprio KanbanBoard */}

      <KanbanBoard
        board={board}
        columnOrder={columnOrder}
        statusLabels={statusLabels}
        errorMessage={error || undefined}
        onItemClick={(id) => navigate(`/tickets/${id}`)}
        onDragEnd={async (itemId, from, to) => {
          try {
            // Como usamos apenas statuses válidos, não há necessidade de mapeamento
            const fromBackend = from;
            const toBackend = to;

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

            setToastMsg(res?.message || 'Status do ticket atualizado com sucesso');
            setToastVariant('success');
            setToastOpen(true);

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
            setToastMsg(finalMsg);
            setToastVariant('error');
            setToastOpen(true);
            // Recarregar o board para desfazer otimista e refletir estado real
            try {
              const baseUrl = providerId ? `/providers/${providerId}/tickets/kanban` : `/tickets/kanban`;
              const cacheBuster = `t=${Date.now()}`;
              const url = baseUrl.includes('?') ? `${baseUrl}&${cacheBuster}` : `${baseUrl}?${cacheBuster}`;
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
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        title={toastVariant === 'success' ? 'Sucesso' : 'Erro'}
        description={toastMsg}
        variant={toastVariant}
      />
    </div>
  );
};

export default TicketsKanbanPage;