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
  const [draggingItemId, setDraggingItemId] = React.useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);
  return (
    <div className={className || 'kanban-board'} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
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
        >
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>{statusLabels[col] || col}</strong>
              <Badge variant="secondary">{board[col]?.length || 0}</Badge>
            </div>
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
              onDragOver={(e: React.DragEvent) => {
                // Permite soltar itens nesta coluna
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
  );
};

export default KanbanBoard;