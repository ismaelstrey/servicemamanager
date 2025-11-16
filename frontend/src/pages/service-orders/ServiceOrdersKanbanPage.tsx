import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { decodeJwt } from '../../utils/jwt';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { ApiService } from '../../services/api';
import ServiceOrderService from '../../services/serviceOrderService';
import { Button, Alert, LogoLoader, Heading } from '../../components/ui';
import { useProviderContext } from '../../contexts/providerContext';

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

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;


const ActionsRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ServiceOrdersKanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [board, setBoard] = useState<KanbanBoardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedProviderId } = useProviderContext();
  const providerId = useMemo(() => {
    const fromQuery = searchParams.get('provider');
    if (fromQuery) return parseInt(fromQuery);
    if (selectedProviderId != null) return Number(selectedProviderId);
    const token = localStorage.getItem('token');
    const payload = decodeJwt(token ?? undefined);
    const pid = (payload as any)?.providerId;
    return typeof pid === 'number' ? pid : undefined;
  }, [searchParams, selectedProviderId]);

  useEffect(() => {
    const fetchBoard = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!providerId) {
          throw { response: { data: { message: 'providerId obrigatório para Kanban' } } };
        }
        const url = `/service-orders/kanban?providerId=${providerId}`;
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
    return <LogoLoader fullscreen message="Carregando Kanban de Ordens de Serviço..." />;
  }

  return (
    <PageWrapper>
      <HeaderRow>
        <Heading level={1}>Ordens de Serviço — Kanban</Heading>
        <ActionsRow>
          <Button variant="secondary" onClick={() => navigate('/service-orders')}>Lista de OS</Button>
          <Button onClick={() => {
            const url = providerId ? `/service-orders/kanban?providerId=${providerId}` : undefined;
            if (!url) { setError('providerId obrigatório para Kanban'); return; }
            setLoading(true);
            ApiService.get<KanbanBoardData>(url).then(r => setBoard(r.data || {})).finally(() => setLoading(false));
          }}>Recarregar</Button>
        </ActionsRow>
      </HeaderRow>

      {error && (<Alert variant="error">{error}</Alert>)}

      <KanbanBoard
        board={board}
        columnOrder={columnOrder}
        statusLabels={statusLabels}
        errorMessage={error || undefined}
        onDragEnd={handleDragEnd}
        onError={(msg) => setError(msg)}
        onItemClick={(id) => navigate(`/service-orders/${id}`)}
      />
    </PageWrapper>
  );
};

export default ServiceOrdersKanbanPage;
