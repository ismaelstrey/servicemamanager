import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketCreateModal } from '../../contexts/ticketCreateModalContext';
import { Button, Spinner, Toast } from '../../components/ui';
import KanbanBoard, { type KanbanBoardData, type KanbanItem } from '../../components/kanban/KanbanBoard';
import { ApiService } from '../../services/api';
import { useProviderContext } from '../../contexts/providerContext';
import TicketsKanbanColumnsFilter from '../../components/tickets/TicketsKanbanColumnsFilter'
import KanbanFilters from '../../components/tickets/KanbanFilters'
import { useQuery, useQueryClient } from '@tanstack/react-query'

type LocalBoard = KanbanBoardData;

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  assigned: 'Atribuído',
  in_progress: 'Em Andamento',
  pending: 'Pendente',
  resolved: 'Resolvido',
  closed: 'Fechado',
  cancelled: 'Cancelado',
};



const baseColumnOrder = ['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled'];

const TicketsKanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const ticketModal = useTicketCreateModal();
  const [board, setBoard] = useState<LocalBoard>({});
  
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVariant, setToastVariant] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  const { selectedProviderId } = useProviderContext();
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<'all'|'low'|'medium'|'high'|'urgent'|'critical'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('tickets.kanban.visibleColumns')
      const parsed = raw ? JSON.parse(raw) as string[] : []
      const valid = parsed.filter((c) => baseColumnOrder.includes(c))
      return valid.length > 0 ? valid : [...baseColumnOrder]
    } catch {
      return [...baseColumnOrder]
    }
  })

  const visibleColumnOrder = useMemo(() => {
    return baseColumnOrder.filter((c) => selectedColumns.includes(c))
  }, [selectedColumns])

  useEffect(() => {
    localStorage.setItem('tickets.kanban.visibleColumns', JSON.stringify(selectedColumns))
  }, [selectedColumns])

  const queryClient = useQueryClient()
  const kanbanQuery = useQuery({
    queryKey: ['tickets-kanban', { providerId: selectedProviderId }],
    queryFn: async () => {
      const url = (selectedProviderId == null)
        ? `/tickets/kanban`
        : `/providers/${selectedProviderId}/tickets/kanban`;
      const res = await ApiService.get<LocalBoard>(url);
      const raw = res.data || {};
      const normalized: LocalBoard = {} as LocalBoard;
      Object.keys(raw || {}).forEach((key) => {
        const newKey = key === 'waiting_client' ? 'pending' : key;
        const incoming = ((raw as any)[key] || []) as any[];
        const existing = ((normalized as any)[newKey] || []) as any[];
        (normalized as any)[newKey] = [...existing, ...incoming];
      });
      const completed: LocalBoard = {} as LocalBoard;
      for (const col of baseColumnOrder) {
        completed[col] = (normalized[col] || []).map((item: KanbanItem) => ({
          id: item.id,
          title: item.title ?? `Ticket #${item.id}`,
          priority: item.priority ?? 'medium',
          updatedAt: item.updatedAt ?? new Date().toISOString(),
          provider: item.provider,
          openedBy: item.openedBy ?? null,
        }));
      }
      return completed
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  })
  useEffect(() => {
    if (kanbanQuery.data) setBoard(kanbanQuery.data)
    if (kanbanQuery.isError) setError('Erro ao carregar o Kanban de tickets.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanbanQuery.data, kanbanQuery.isError])
  useEffect(() => {
    const handler = (e: any) => {
      const providerId = e?.detail?.providerId ?? null
      if (selectedProviderId == null || providerId == null || providerId === selectedProviderId) {
        queryClient.invalidateQueries({ queryKey: ['tickets-kanban'] })
      }
    }
    window.addEventListener('ticket-created', handler as any)
    return () => window.removeEventListener('ticket-created', handler as any)
  }, [selectedProviderId, queryClient])

  if (kanbanQuery.isLoading) {
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
          {selectedProviderId == null ? (
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Todos os provedores</p>
          ) : (
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Provider #{selectedProviderId}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <TicketsKanbanColumnsFilter
            availableColumns={baseColumnOrder}
            selectedColumns={selectedColumns}
            statusLabels={statusLabels}
            onToggle={(col) => setSelectedColumns((prev) => {
              const has = prev.includes(col)
              const next = has ? prev.filter((c) => c !== col) : [...prev, col]
              return next.length > 0 ? next : prev
            })}
            onSelectAll={() => setSelectedColumns([...baseColumnOrder])}
            onHideDone={() => setSelectedColumns(baseColumnOrder.filter((c) => !['resolved','closed','cancelled'].includes(c)))}
          />
          <Button variant="ghost" size="sm" onClick={() => setFiltersOpen(v => !v)}>Filtros</Button>
          <Button variant="secondary" onClick={() => navigate('/tickets')}>Voltar para Lista</Button>
          <Button variant="primary" onClick={() => ticketModal.open()}>Novo Ticket</Button>
        </div>
      </div>

      <KanbanFilters
        visible={filtersOpen}
        onToggle={() => setFiltersOpen(v => !v)}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        search={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Erro sutil será mostrado dentro do próprio KanbanBoard */}

      <KanbanBoard
        board={(() => {
          const filtered: KanbanBoard = {} as KanbanBoard
          Object.keys(board || {}).forEach((col) => {
            const items = (board as any)[col] || []
            const byPriority = priorityFilter === 'all' ? items : items.filter((i: any) => String(i.priority).toLowerCase() === priorityFilter)
            const bySearch = searchTerm ? byPriority.filter((i: any) => String(i.title || '').toLowerCase().includes(searchTerm.toLowerCase())) : byPriority
            ;(filtered as any)[col] = bySearch
          })
          return filtered
        })()}
        columnOrder={visibleColumnOrder}
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
              const baseUrl = (selectedProviderId == null) ? `/tickets/kanban` : `/providers/${selectedProviderId}/tickets/kanban`;
              const cacheBuster = `t=${Date.now()}`;
              const url = baseUrl.includes('?') ? `${baseUrl}&${cacheBuster}` : `${baseUrl}?${cacheBuster}`;
              const fresh = await ApiService.get<LocalBoard>(url);
              // Normalização conforme carregamento inicial (mesma lógica)
              const raw = fresh.data || {};
              const normalized: LocalBoard = {} as LocalBoard;
              Object.keys(raw || {}).forEach((key) => {
                const newKey = key === 'waiting_client' ? 'pending' : key;
                const incoming = ((raw as any)[key] || []) as any[];
                const existing = ((normalized as any)[newKey] || []) as any[];
                (normalized as any)[newKey] = [...existing, ...incoming];
              });
              const completed: LocalBoard = {} as LocalBoard;
              for (const col of baseColumnOrder) {
                completed[col] = (normalized[col] || []).map((item: KanbanItem) => ({
                  id: item.id,
                  title: item.title ?? `Ticket #${item.id}`,
                  priority: item.priority ?? 'medium',
                  updatedAt: item.updatedAt ?? new Date().toISOString(),
                  provider: item.provider,
                  openedBy: item.openedBy ?? null,
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
