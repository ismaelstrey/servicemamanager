import React from 'react';
import styled from 'styled-components';
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
    <ItemRoot
      draggable
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', String(item.id));
        e.dataTransfer.setData('kanban-from', columnKey);
        onDragStart && onDragStart(item.id, columnKey);
      }}
      onDragEnd={() => {
        onDragEnd && onDragEnd();
      }}
      $isDragging={Boolean(isDragging)}
    >
      <TopRow>
        <IdBadge aria-label={`ID do item: ${item.id}`}>{item.id}</IdBadge>
        <Title>{item.title}</Title>
        <Badge variant={getPriorityVariant(String(item.priority))}>{String(item.priority)}</Badge>
      </TopRow>
      <Meta>
        Atualizado em {new Date(item.updatedAt).toLocaleString('pt-BR')}
      </Meta>
      <Actions>
        <Button size="sm" variant="secondary" onClick={() => onItemClick && onItemClick(item.id)}>
          Abrir
        </Button>
      </Actions>
    </ItemRoot>
  );
};

export default KanbanItemCard;

const ItemRoot = styled.div<{ $isDragging?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  cursor: grab;
  transition: ${({ theme }) => theme.animations.transition.interactive};
  box-shadow: ${({ theme, $isDragging }) => ($isDragging ? `0 8px 20px ${theme.colors.alpha.black[20]}` : 'none')};
  opacity: ${({ $isDragging }) => ($isDragging ? 0.85 : 1)};
  transform: ${({ $isDragging }) => ($isDragging ? 'scale(0.98)' : 'none')};
  outline: ${({ theme, $isDragging }) => ($isDragging ? `2px solid ${theme.colors.primary.main}` : 'none')};
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const IdBadge = styled.code`
  display: inline-block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  padding: 0 ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.alpha.black[5]};
`;

const Title = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const Meta = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Actions = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;