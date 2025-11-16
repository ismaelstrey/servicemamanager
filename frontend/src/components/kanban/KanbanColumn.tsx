import React from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardBody, Badge } from '../ui';
import { List, Sparkles, Play, Activity, Hourglass, CheckCircle, Archive, XCircle } from 'lucide-react';
import KanbanItemCard from './KanbanItemCard';
import type { KanbanItem } from './KanbanBoard';

interface KanbanColumnProps {
  columnKey: string;
  label: string;
  items: KanbanItem[];
  statusIcon?: React.ReactNode;
  dragOverColumn?: string | null;
  setDragOverColumn?: (col: string | null) => void;
  draggingItemId?: number | null;
  onItemClick?: (id: number) => void;
  onItemDragStart?: (id: number, fromStatus: string) => void;
  onDropItem?: (itemId: number, fromStatus: string, toStatus: string) => void;
  onError?: (message: string) => void;
}

const getStatusMeta = (key: string) => {
  const k = key.toLowerCase();
  const meta: { color: string; bg: string; icon: React.ReactNode } = {
    color: '#3b82f6',
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
  else if (/(feito|done|resolved|completed)/.test(k)) setMeta(green, <CheckCircle size={16} aria-hidden />);
  else if (/(fechado|closed|archive)/.test(k)) setMeta(gray, <Archive size={16} aria-hidden />);
  else if (/(cancelado|canceled|cancel)/.test(k)) setMeta(red, <XCircle size={16} aria-hidden />);
  return meta;
};

const ColumnRoot = styled.div<{ $isDragOver?: boolean }>`
  transition: background 0.2s, box-shadow 0.2s;
  background: ${({ $isDragOver }) => ($isDragOver ? 'rgba(59, 130, 246, 0.08)' : 'transparent')};
  box-shadow: ${({ $isDragOver }) => ($isDragOver ? 'inset 0 0 0 2px rgba(59, 130, 246, 0.25)' : 'none')};
  border-radius: 10px;
`;

const HeaderBar = styled.div<{ $isDragOver?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s ease;
  background: ${({ $isDragOver }) => ($isDragOver ? 'rgba(59, 130, 246, 0.08)' : 'transparent')};
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
`;

const StatusIconWrap = styled.span<{ $bg: string; $color: string; $border: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $border }) => $border};
`;

const ItemsList = styled.div<{ $isDragOver?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 40px;
  border-radius: 8px;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
  background: ${({ $isDragOver }) => ($isDragOver ? 'rgba(59, 130, 246, 0.06)' : 'transparent')};
  border: ${({ $isDragOver }) => ($isDragOver ? '2px dashed rgba(59, 130, 246, 0.5)' : '2px dashed transparent')};
`;

const EmptyText = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  columnKey,
  label,
  items,
  statusIcon,
  dragOverColumn,
  setDragOverColumn,
  draggingItemId,
  onItemClick,
  onItemDragStart,
  onDropItem,
  onError,
}) => {
  const meta = getStatusMeta(columnKey);
  const iconNode = statusIcon ?? meta.icon;

  return (
    <ColumnRoot
      $isDragOver={dragOverColumn === columnKey}
      onDragOver={(e: React.DragEvent) => {
        e.preventDefault();
        setDragOverColumn && setDragOverColumn(columnKey);
        e.dataTransfer.dropEffect = 'move';
      }}
      onDragLeave={() => {
        if (dragOverColumn === columnKey) setDragOverColumn && setDragOverColumn(null);
      }}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault();
        const itemIdStr = e.dataTransfer.getData('text/plain');
        const fromStatus = e.dataTransfer.getData('kanban-from');
        const itemId = parseInt(itemIdStr);
        setDragOverColumn && setDragOverColumn(null);
        if (!isNaN(itemId) && fromStatus) {
          onDropItem && onDropItem(itemId, fromStatus, columnKey);
        } else {
          onError && onError('Não foi possível identificar o item arrastado ou a coluna de origem.');
        }
      }}
    >
      <Card>
        <CardHeader>
          <HeaderBar $isDragOver={dragOverColumn === columnKey}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StatusIconWrap aria-hidden $bg={meta.bg} $color={meta.color} $border={meta.color.replace('rgb', 'rgba').replace(')', ', 0.4)')}>
                {iconNode}
              </StatusIconWrap>
              <strong style={{ fontWeight: 700 }}>{label}</strong>
            </div>
            <Badge variant="secondary">{items?.length || 0}</Badge>
          </HeaderBar>
        </CardHeader>
        <CardBody>
          <ItemsList $isDragOver={dragOverColumn === columnKey}>
            {(items || []).map((item) => (
              <KanbanItemCard
                key={item.id}
                item={item}
                columnKey={columnKey}
                isDragging={draggingItemId === item.id}
                onItemClick={onItemClick}
                onDragStart={onItemDragStart}
                onDragEnd={() => { /* noop: visual reset is handled in board */ }}
              />
            ))}
            {(items?.length || 0) === 0 && (
              <EmptyText>Sem itens</EmptyText>
            )}
          </ItemsList>
        </CardBody>
      </Card>
    </ColumnRoot>
  );
};

export default KanbanColumn;