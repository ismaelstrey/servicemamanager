import React from 'react';
import styled from 'styled-components';
import KanbanColumn from './KanbanColumn';

export type KanbanItem = {
  id: number;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  updatedAt: string | Date;
  provider?: { id: number; name: string; workspace?: string };
  openedBy?: { id: number; name: string; email?: string } | null;
};
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



const BoardRoot = styled.div`
  display: block;
`;

const ColumnsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const ColumnWrap = styled.div<{ $withLeftBorder?: boolean }>`
  border-left: ${({ $withLeftBorder, theme }) => ($withLeftBorder ? `2px dashed ${theme.colors.border.primary}` : 'none')};
  padding-left: ${({ $withLeftBorder, theme }) => ($withLeftBorder ? theme.spacing.sm : 0)};
`;

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
    <BoardRoot className={className}>
      <ColumnsGrid>
        {columnOrder
          .filter((col) => board[col] && board[col].length >= 0)
          .map((col, idx) => (
            <ColumnWrap key={col} $withLeftBorder={idx > 0}>
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
            </ColumnWrap>
          ))}
      </ColumnsGrid>
    </BoardRoot>
  );
};

export default KanbanBoard;