import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { ApiService } from '../../services/api';
import ServiceOrderService from '../../services/serviceOrderService';
import { Button, Spinner } from '../../components/ui';

type KanbanBoardData = Record<string, { id: number; title: string; priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'; updatedAt: string | Date }[]>;

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  waiting_parts: 'Aguardando Peças',
  waiting_client: 'Aguardando Cliente',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const columnOrder = ['pending', 'in_progress', 'waiting_parts', 'waiting_client', 'completed', 'cancelled'];

const ServiceOrdersKanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [board, setBoard] = useState<KanbanBoardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const providerId = useMemo(() => {
    const fromQuery = searchParams.get('provider');
    if (fromQuery) return parseInt(fromQuery);
    return undefined;
  }, [searchParams]);

  useEffect(() => {
    const fetchBoard = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = providerId ? `/service-orders/kanban?providerId=${providerId}` : `/service-orders/kanban`;
        const res = await ApiService.get<KanbanBoardData>(url);
        setBoard(res.data || {});
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Falha ao carregar Kanban de OS';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [providerId]);

  const handleDragEnd = async (itemId: number, from: string, to: string) => {
    setError(null);
    if (from === to) return;

    // Otimista: mover imediatamente
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

    try {
      // Atualizar no backend (PATCH /service-orders/:id/status)
      await ServiceOrderService.updateServiceOrderStatus(String(itemId), to as any);
    } catch (err: any) {
      // Parse formato de erro JSON: { success, message, errors }
      const apiData = err?.response?.data;
      const mainMessage = apiData?.message || err?.message || 'Erro ao atualizar status da OS';
      const details = Array.isArray(apiData?.errors) ? apiData.errors.map((e: any) => e?.message).filter(Boolean).join(' | ') : '';
      const fullMessage = [mainMessage, details].filter(Boolean).join(' — ');
      setError(fullMessage);

      // Recarrega o board para desfazer otimista
      try {
        const url = providerId ? `/service-orders/kanban?providerId=${providerId}` : `/service-orders/kanban`;
        const res = await ApiService.get<KanbanBoardData>(url);
        setBoard(res.data || {});
      } catch {}
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Spinner />
        <span>Carregando Kanban de Ordens de Serviço...</span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Ordens de Serviço — Kanban</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => navigate('/service-orders')}>Lista de OS</Button>
          <Button onClick={() => {
            const url = providerId ? `/service-orders/kanban?providerId=${providerId}` : `/service-orders/kanban`;
            setLoading(true);
            ApiService.get<KanbanBoardData>(url).then(r => setBoard(r.data || {})).finally(() => setLoading(false));
          }}>Recarregar</Button>
        </div>
      </div>

      <KanbanBoard
        board={board}
        columnOrder={columnOrder}
        statusLabels={statusLabels}
        errorMessage={error || undefined}
        onDragEnd={handleDragEnd}
        onError={(msg) => setError(msg)}
        onItemClick={(id) => navigate(`/service-orders/${id}`)}
      />
    </div>
  );
};

export default ServiceOrdersKanbanPage;