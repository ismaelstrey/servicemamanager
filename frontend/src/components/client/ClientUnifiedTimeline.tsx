import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardBody, Button, ButtonGroup, Pagination, Timeline,  Badge } from '../ui';
import ClientTimelineService, { type ClientResourceType, type UnifiedTimelineItem } from '../../services/clientTimelineService';

export interface ClientUnifiedTimelineProps {
  resourceType: ClientResourceType;
  resourceId: string | number;
  pageSize?: number;
}

type FilterType = 'all' | 'history' | 'comment';

const actionEmoji: Record<string, string> = {
  comment_added: '💬',
  status_changed: '🔄',
  priority_changed: '⚡',
  updated: '✏️',
};

function formatTitle(it: UnifiedTimelineItem): string {
  const emoji = actionEmoji[it.action] ?? (it.source === 'comment' ? '💬' : '📝');
  return `${emoji} ${it.description ?? it.action}`;
}

function formatDescription(it: UnifiedTimelineItem): string | undefined {
  if (it.source === 'history') {
    const field = it.metadata?.field;
    const oldValue = it.metadata?.oldValue;
    const newValue = it.metadata?.newValue;
    if (field && (oldValue !== undefined || newValue !== undefined)) {
      return `Campo ${String(field)} alterado: ${String(oldValue ?? '—')} → ${String(newValue ?? '—')}`;
    }
  }
  if (it.source === 'comment') {
    const authorName = it.metadata?.authorName ?? it.metadata?.authorId ? `Autor #${it.metadata?.authorId}` : undefined;
    const edited = it.metadata?.isEdited ? ' (editado)' : '';
    if (authorName) return `${authorName}${edited}`;
  }
  return undefined;
}

export const ClientUnifiedTimeline: React.FC<ClientUnifiedTimelineProps> = ({ resourceType, resourceId, pageSize = 20 }) => {
  const [items, setItems] = useState<UnifiedTimelineItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await ClientTimelineService.getTimeline(resourceType, resourceId, { page, limit: pageSize });
        if (!mounted) return;
        setItems(res.data ?? []);
        setTotalPages(res.pagination?.totalPages ?? 1);
        setTotal(res.pagination?.total ?? (res.data?.length ?? 0));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Falha ao carregar timeline');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [resourceType, resourceId, page, pageSize]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((it) => it.source === filter);
  }, [items, filter]);

  const timelineItems = useMemo(() => {
    return filteredItems.map((it) => ({
      id: it.id,
      time: new Date(it.createdAt).toLocaleString('pt-BR', { hour12: false }),
      title: formatTitle(it),
      description: formatDescription(it),
    }));
  }, [filteredItems]);

  return (
    <Card variant="outlined">
      <CardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>Timeline</strong>
            <Badge variant="info">{total} eventos</Badge>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <ButtonGroup>
              <Button variant={filter === 'all' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('all')}>Tudo</Button>
              <Button variant={filter === 'history' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('history')}>Histórico</Button>
              <Button variant={filter === 'comment' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('comment')}>Comentários</Button>
            </ButtonGroup>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {loading && <p>Carregando timeline...</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        {!loading && !error && (
          timelineItems.length ? (
            <Timeline items={timelineItems} />
          ) : (
            <p style={{ color: '#666' }}>Nenhum evento encontrado.</p>
          )
        )}
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      </CardBody>
    </Card>
  );
};

export default ClientUnifiedTimeline;