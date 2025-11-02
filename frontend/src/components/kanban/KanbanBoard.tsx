import React from 'react';
import { Card, CardHeader, CardBody, Badge, Button } from '../ui';

export type KanbanItem = { id: number; title: string; priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'; updatedAt: string | Date };
export type KanbanBoardData = Record<string, KanbanItem[]>;

export interface KanbanBoardProps {
  board: KanbanBoardData;
  columnOrder: string[];
  statusLabels?: Record<string, string>;
  onItemClick?: (itemId: number) => void;
  onDragStart?: (itemId: number, fromStatus: string) => void;
  onDragEnd?: (itemId: number, fromStatus: string, toStatus: string) => void;
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
  onItemClick,
  onDragStart,
  onDragEnd,
  className,
}) => {
  return (
    <div className={className || 'kanban-board'} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
      {columnOrder.filter(col => board[col] && board[col].length >= 0).map((col) => (
        <Card key={col}>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>{statusLabels[col] || col}</strong>
              <Badge variant="secondary">{board[col]?.length || 0}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
              onDragOver={(e: React.DragEvent) => {
                // Permite soltar itens nesta coluna
                e.preventDefault();
              }}
              onDrop={(e: React.DragEvent) => {
                e.preventDefault();
                const itemIdStr = e.dataTransfer.getData('text/plain');
                const fromStatus = e.dataTransfer.getData('kanban-from');
                const itemId = parseInt(itemIdStr);
                if (!isNaN(itemId) && fromStatus) {
                  onDragEnd && onDragEnd(itemId, fromStatus, col);
                }
              }}
            >
              {(board[col] || []).map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e: React.DragEvent) => {
                    e.dataTransfer.setData('text/plain', String(item.id));
                    e.dataTransfer.setData('kanban-from', col);
                    onDragStart && onDragStart(item.id, col);
                  }}
                  style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.75rem', background: 'var(--color-surface)' }}
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
      ))}
    </div>
  );
};

export default KanbanBoard;