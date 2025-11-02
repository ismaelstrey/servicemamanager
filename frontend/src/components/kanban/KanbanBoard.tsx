import React from 'react';
import { Card, CardHeader, CardBody, Badge, Button } from '../ui';
import { List, Sparkles, Play, Activity, Hourglass, CheckCircle, Archive, XCircle } from 'lucide-react';

export type KanbanItem = { id: number; title: string; priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'; updatedAt: string | Date };
export type KanbanBoardData = Record<string, KanbanItem[]>;

export interface KanbanBoardProps {
  board: KanbanBoardData;
  columnOrder: string[];
  statusLabels?: Record<string, string>;
  statusIcons?: Record<string, React.ReactNode>;
  onItemClick?: (itemId: number) => void;
  onDragStart?: (itemId: number, fromStatus: string) => void;
  onDragEnd?: (itemId: number, fromStatus: string, toStatus: string) => void;
  errorMessage?: string;
  onError?: (message: string) => void;
  className?: string;
}

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

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  columnOrder,
  statusLabels = {},
  statusIcons = {},
  onItemClick,
  onDragStart,
  onDragEnd,
  errorMessage,
  onError,
  className,
}) => {
  const [draggingItemId, setDraggingItemId] = React.useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);

  const getStatusMeta = (key: string) => {
    const k = key.toLowerCase();
    // Default colors per common statuses
    const meta: { color: string; bg: string; icon: React.ReactNode } = {
      color: '#3b82f6', // blue-500
      bg: 'rgba(59, 130, 246, 0.12)',
      icon: <Sparkles size={16} aria-hidden />,
    };
    const setMeta = (color: string, iconNode: React.ReactNode) => {
      meta.color = color;
      meta.bg = color.replace('rgb', 'rgba').replace(')', ', 0.12)');
      meta.icon = iconNode;
    };
    const blue = 'rgb(59, 130, 246)';
    const violet = 'rgb(139, 92, 246)';
    const amber = 'rgb(245, 158, 11)';
    const teal = 'rgb(13, 148, 136)';
    const green = 'rgb(34, 197, 94)';
    const red = 'rgb(239, 68, 68)';
    const gray = 'rgb(107, 114, 128)';
    const sky = 'rgb(14, 165, 233)';
    if (/(backlog|lista|pendente)/.test(k)) setMeta(violet, <List size={16} aria-hidden />);
    else if (/(novo|new)/.test(k)) setMeta(blue, <Sparkles size={16} aria-hidden />);
    else if (/(aberto|open)/.test(k)) setMeta(sky, <Play size={16} aria-hidden />);
    else if (/(progresso|andamento|in_progress|doing)/.test(k)) setMeta(teal, <Activity size={16} aria-hidden />);
    else if (/(aguardando|waiting|hold)/.test(k)) setMeta(amber, <Hourglass size={16} aria-hidden />);
    else if (/(feito|done|resolved)/.test(k)) setMeta(green, <CheckCircle size={16} aria-hidden />);
    else if (/(fechado|closed|archive)/.test(k)) setMeta(gray, <Archive size={16} aria-hidden />);
    else if (/(cancelado|canceled|cancel)/.test(k)) setMeta(red, <XCircle size={16} aria-hidden />);
    return meta;
  };
  return (
    <div className={className || 'kanban-board'}>
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            marginBottom: '0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontWeight: 600 }}>Erro</span>
          <span style={{ opacity: 0.9 }}>{errorMessage}</span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
      {columnOrder.filter(col => board[col] && board[col].length >= 0).map((col, idx) => (
        <div
          key={col}
          className="kanban-column"
          style={{
            borderLeft: idx > 0 ? '2px dashed var(--color-border)' : undefined,
            paddingLeft: idx > 0 ? '0.75rem' : undefined,
            transition: 'background 0.2s, box-shadow 0.2s',
            background: dragOverColumn === col ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
            boxShadow: dragOverColumn === col ? 'inset 0 0 0 2px rgba(59, 130, 246, 0.25)' : 'none',
            borderRadius: '10px'
          }}
          onDragOver={(e: React.DragEvent) => {
            e.preventDefault();
            setDragOverColumn(col);
            e.dataTransfer.dropEffect = 'move';
          }}
          onDragLeave={() => {
            if (dragOverColumn === col) setDragOverColumn(null);
          }}
          onDrop={(e: React.DragEvent) => {
            e.preventDefault();
            const itemIdStr = e.dataTransfer.getData('text/plain');
            const fromStatus = e.dataTransfer.getData('kanban-from');
            const itemId = parseInt(itemIdStr);
            setDragOverColumn(null);
            setDraggingItemId(null);
            if (!isNaN(itemId) && fromStatus) {
              onDragEnd && onDragEnd(itemId, fromStatus, col);
            } else {
              onError && onError('Não foi possível identificar o item arrastado ou a coluna de origem.');
            }
          }}
        >
        <Card>
          <CardHeader>
            {(() => {
              const meta = getStatusMeta(col);
              const iconNode = statusIcons[col] ?? meta.icon;
              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.2s ease',
                    background: dragOverColumn === col ? 'rgba(59, 130, 246, 0.08)' : undefined,
                    borderRadius: '8px',
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      aria-hidden
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.color.replace('rgb', 'rgba').replace(')', ', 0.4)')}`,
                      }}
                    >
                      {iconNode}
                    </span>
                    <strong style={{ fontWeight: 700 }}>{statusLabels[col] || col}</strong>
                  </div>
                  <Badge variant="secondary">{board[col]?.length || 0}</Badge>
                </div>
              );
            })()}
          </CardHeader>
          <CardBody>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                minHeight: '40px',
                borderRadius: '8px',
                transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                background: dragOverColumn === col ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
                border: dragOverColumn === col ? '2px dashed rgba(59, 130, 246, 0.5)' : '2px dashed transparent'
              }}
            >
              {(board[col] || []).map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e: React.DragEvent) => {
                    e.dataTransfer.setData('text/plain', String(item.id));
                    e.dataTransfer.setData('kanban-from', col);
                    setDraggingItemId(item.id);
                    onDragStart && onDragStart(item.id, col);
                  }}
                  onDragEnd={() => {
                    setDraggingItemId(null);
                  }}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    background: 'var(--color-surface)',
                    cursor: 'grab',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
                    boxShadow: draggingItemId === item.id ? '0 8px 20px rgba(0,0,0,0.18)' : 'none',
                    opacity: draggingItemId === item.id ? 0.85 : 1,
                    transform: draggingItemId === item.id ? 'scale(0.98)' : 'none',
                    outline: draggingItemId === item.id ? '2px solid rgba(59, 130, 246, 0.5)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{item.title}</span>
                    <Badge variant={getPriorityVariant(String(item.priority))}>{String(item.priority)}</Badge>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Atualizado em {new Date(item.updatedAt).toLocaleString('pt-BR')}
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <Button size="sm" variant="secondary" onClick={() => onItemClick && onItemClick(item.id)}>Abrir</Button>
                  </div>
                </div>
              ))}
              {(board[col]?.length || 0) === 0 && (
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Sem itens</div>
              )}
            </div>
          </CardBody>
        </Card>
        </div>
      ))}
      </div>
    </div>
  );
};

export default KanbanBoard;