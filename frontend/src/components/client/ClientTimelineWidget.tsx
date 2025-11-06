import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardBody, Button,  Input, Badge, Pagination, Timeline } from '../ui';
import ClientTimelineService, { type ClientResourceType, type UnifiedTimelineItem } from '../../services/clientTimelineService';

export interface ClientTimelineWidgetProps {
  resourceType: ClientResourceType;
  resourceId: string | number;
  pageSize?: number;
}

type ActionKey = 'comment_added' | 'status_changed' | 'priority_changed' | 'updated';

const ACTION_OPTIONS: { key: ActionKey; label: string; emoji: string }[] = [
  { key: 'comment_added', label: 'Comentários', emoji: '💬' },
  { key: 'status_changed', label: 'Status', emoji: '🔄' },
  { key: 'priority_changed', label: 'Prioridade', emoji: '⚡' },
  { key: 'updated', label: 'Atualizações', emoji: '✏️' },
];

export const ClientTimelineWidget: React.FC<ClientTimelineWidgetProps> = ({ resourceType, resourceId, pageSize = 20 }) => {
  const [items, setItems] = useState<UnifiedTimelineItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<ActionKey[]>(['comment_added', 'status_changed', 'priority_changed', 'updated']);
  const [query, setQuery] = useState('');

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
    const actionFiltered = items.filter((it) => selectedActions.includes(it.action as ActionKey));
    if (!query.trim()) return actionFiltered;
    const q = query.trim().toLowerCase();
    return actionFiltered.filter((it) => {
      const text = `${it.description ?? ''} ${JSON.stringify(it.metadata ?? {})}`.toLowerCase();
      return text.includes(q);
    });
  }, [items, selectedActions, query]);

  const uiItems = useMemo(() => {
    return filteredItems.map((it) => ({
      id: it.id,
      time: new Date(it.createdAt).toLocaleString('pt-BR', { hour12: false }),
      title: `${(ACTION_OPTIONS.find(a => a.key === it.action)?.emoji) ?? (it.source === 'comment' ? '💬' : '📝')} ${it.description ?? it.action}`,
      description: (() => {
        if (it.source === 'history') {
          const field = it.metadata?.field;
          const oldValue = it.metadata?.oldValue;
          const newValue = it.metadata?.newValue;
          if (field && (oldValue !== undefined || newValue !== undefined)) {
            return `Campo ${String(field)}: ${String(oldValue ?? '—')} → ${String(newValue ?? '—')}`;
          }
        }
        if (it.source === 'comment') {
          const authorName = it.metadata?.authorName ?? it.metadata?.authorId ? `Autor #${it.metadata?.authorId}` : undefined;
          const edited = it.metadata?.isEdited ? ' (editado)' : '';
          if (authorName) return `${authorName}${edited}`;
        }
        return undefined;
      })(),
    }));
  }, [filteredItems]);

  const toggleAction = (key: ActionKey) => {
    setSelectedActions((prev) => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const clearFilters = () => {
    setSelectedActions(['comment_added', 'status_changed', 'priority_changed', 'updated']);
    setQuery('');
  };

  return (
    <Card variant="outlined">
      <CardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>Timeline</strong>
            <Badge variant="info">{total} eventos</Badge>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input placeholder="Buscar por texto" value={query} onChange={(e: any) => setQuery(e.target.value)} />
            <Button variant="ghost" onClick={clearFilters}>Limpar</Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {ACTION_OPTIONS.map(({ key, label, emoji }) => (
            <Button
              key={key}
              variant={selectedActions.includes(key) ? 'primary' : 'outline'}
              size="sm"
              onClick={() => toggleAction(key)}
            >{emoji} {label}</Button>
          ))}
        </div>

        {loading && <p>Carregando timeline...</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        {!loading && !error && (
          uiItems.length ? (
            <Timeline items={uiItems} />
          ) : (
            <p style={{ color: '#666' }}>Nenhum evento encontrado com os filtros atuais.</p>
          )
        )}

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      </CardBody>
    </Card>
  );
};

export default ClientTimelineWidget;