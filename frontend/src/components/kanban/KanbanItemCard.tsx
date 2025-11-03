import React from 'react';
import { Badge, Button } from '../ui';
import type { KanbanItem } from './KanbanBoard';

interface KanbanItemCardProps {
  item: KanbanItem;
  columnKey: string;
  isDragging?: boolean;
  onItemClick?: (id: number) => void;
  onDragStart?: (id: number, fromStatus: string) => void;
  onDragEnd?: () => void;
}

const getPriorityVariant = (
  p: string
): 'success' | 'info' | 'warning' | 'danger' | 'secondary' => {
  switch (p) {
    case 'low':
      return 'success';
    case 'medium':
      return 'info';
    case 'high':
      return 'warning';
    case 'urgent':
    case 'critical':
      return 'danger';
    default:
      return 'secondary';
  }
};

export const KanbanItemCard: React.FC<KanbanItemCardProps> = ({
  item,
  columnKey,
  isDragging,
  onItemClick,
  onDragStart,
  onDragEnd,
}) => {
  return (
    <div
      key={item.id}
      draggable
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', String(item.id));
        e.dataTransfer.setData('kanban-from', columnKey);
        onDragStart && onDragStart(item.id, columnKey);
      }}
      onDragEnd={() => {
        onDragEnd && onDragEnd();
      }}
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '0.75rem',
        background: 'var(--color-surface)',
        cursor: 'grab',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
        boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.18)' : 'none',
        opacity: isDragging ? 0.85 : 1,
        transform: isDragging ? 'scale(0.98)' : 'none',
        outline: isDragging ? '2px solid rgba(59, 130, 246, 0.5)' : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.25rem',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <code
            className="kanban-item__id"
            aria-label={`ID do item: ${item.id}`}
            style={{
              display: 'inline-block',
              fontSize: '0.85rem',
              padding: '0 0.4rem',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              background: 'rgba(0,0,0,0.04)'
            }}
          >
            {item.id}
          </code>
          <span style={{ fontWeight: 600 }}>{item.title}</span>
        </div>
        <Badge variant={getPriorityVariant(String(item.priority))}>
          {String(item.priority)}
        </Badge>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
        Atualizado em {new Date(item.updatedAt).toLocaleString('pt-BR')}
      </div>
      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onItemClick && onItemClick(item.id)}
        >
          Abrir
        </Button>
      </div>
    </div>
  );
};

export default KanbanItemCard;