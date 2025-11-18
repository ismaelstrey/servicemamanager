import React from 'react';
import styled from 'styled-components';
import { Badge, Button, Tooltip } from '../ui';
import { motion } from 'framer-motion'
import { Building2, User as UserIcon, Clock } from 'lucide-react'
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
  const getInitials = (name?: string): string => {
    if (!name) return '--'
    const clean = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    const parts = clean.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    const w = parts[0]
    const two = (w[0] || '') + (w[1] || '')
    return (two || '--').toUpperCase()
  }
  return (
    <ItemRoot
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
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
      <DetailsRow>
        <Detail>
          <span><Building2 size={14} style={{ marginRight: 6 }} />{item.provider?.name ?? '—'}{item.provider?.workspace ? ` (${item.provider.workspace})` : ''}</span>
        </Detail>
        <Detail>
          <span><UserIcon size={14} style={{ marginRight: 6 }} />{item.openedBy?.name ?? '—'}{item.openedBy?.email ? ` (${item.openedBy.email})` : ''}</span>
        </Detail>
      </DetailsRow>
      <Actions>
        <Button size="sm" variant="secondary" onClick={() => onItemClick && onItemClick(item.id)}>
          Abrir
        </Button>
      </Actions>
      <FooterRow>
        <Meta>
          <Clock size={14} style={{ marginRight: 6 }} />{new Date(item.updatedAt).toLocaleString('pt-BR')}
        </Meta>
        {item.openedBy?.name ? (
          <Tooltip content={`${item.openedBy.name}${item.openedBy.email ? ` (${item.openedBy.email})` : ''}`} placement="top">
            <AvatarCapsule aria-label="Autor do ticket">{getInitials(item.openedBy.name)}</AvatarCapsule>
          </Tooltip>
        ) : null}
      </FooterRow>
    </ItemRoot>
  );
};

export default KanbanItemCard;

const ItemRoot = styled(motion.div)<{ $isDragging?: boolean }>`
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
  &:hover { box-shadow: ${({ theme }) => theme.shadows.md}; border-color: ${({ theme }) => theme.colors.alpha.black[20]}; background: ${({ theme }) => theme.colors.background.secondary}; }
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const DetailsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Detail = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: baseline;
  min-width: 0;
  & > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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
  display: inline-flex;
  align-items: center;
`;

const Actions = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FooterRow = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AvatarCapsule = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.alpha.black[10]};
`;
