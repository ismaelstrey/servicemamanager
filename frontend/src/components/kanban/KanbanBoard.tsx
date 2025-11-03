import React from 'react';
import KanbanColumn from './KanbanColumn';

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



export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  columnOrder,
  statusLabels = {},
  statusIcons = {},
  onItemClick,
  onDragStart,
  onDragEnd,
  onError,
  className,
}) => {
  const [draggingItemId, setDraggingItemId] = React.useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);
  return (
    <div className={className || 'kanban-board'}>     
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {columnOrder
          .filter((col) => board[col] && board[col].length >= 0)
          .map((col, idx) => (
            <div
              key={col}
              style={{
                borderLeft: idx > 0 ? '2px dashed var(--color-border)' : undefined,
                paddingLeft: idx > 0 ? '0.75rem' : undefined,
              }}
            >
              <KanbanColumn
                columnKey={col}
                label={statusLabels[col] || col}
                items={board[col] || []}
                statusIcon={statusIcons[col]}
                dragOverColumn={dragOverColumn}
                setDragOverColumn={setDragOverColumn}
                draggingItemId={draggingItemId}
                onItemClick={onItemClick}
                onItemDragStart={(id, from) => {
                  setDraggingItemId(id);
                  onDragStart && onDragStart(id, from);
                }}
                onDropItem={(itemId, fromStatus, toStatus) => {
                  setDraggingItemId(null);
                  onDragEnd && onDragEnd(itemId, fromStatus, toStatus);
                }}
                onError={onError}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default KanbanBoard;