import React from 'react';
import styled from 'styled-components';

export interface TimelineItem {
  type: 'ticket' | 'equipment' | 'password' | 'service_order' | string;
  id: number | string;
  title: string;
  description?: string;
  createdAt: string | Date;
}

export interface TimelineProps {
  items: TimelineItem[];
  onItemClick?: (item: TimelineItem) => void;
  emptyMessage?: string;
}

const Wrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: ${({ theme }) => theme.spacing.md};
`;

const Item = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border.primary};

  &:last-child { border-bottom: none; }
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.main};
  margin-top: 6px;
`;

const Title = styled.div`
  font-weight: 600;
`;

const Description = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Time = styled.time`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
`;

const typeEmoji: Record<string, string> = {
  ticket: '🎫',
  equipment: '🧰',
  password: '🔑',
  service_order: '🔧',
};

const formatDate = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleString('pt-BR', { hour12: false });
};

const Timeline: React.FC<TimelineProps> = ({ items, onItemClick, emptyMessage = 'Nenhuma atividade recente.' }) => {
  if (!items?.length) {
    return <Wrapper>{emptyMessage}</Wrapper>;
  }

  return (
    <Wrapper>
      {items.map((it) => (
        <Item key={`${it.type}-${it.id}`} onClick={() => onItemClick?.(it)} style={{ cursor: onItemClick ? 'pointer' : 'default' }}>
          <Dot title={it.type} aria-label={it.type} />
          <div>
            <Title>{typeEmoji[it.type] ?? '📝'} {it.title}</Title>
            {it.description && <Description>{it.description}</Description>}
          </div>
          <Time dateTime={typeof it.createdAt === 'string' ? it.createdAt : it.createdAt.toISOString()}>
            {formatDate(it.createdAt)}
          </Time>
        </Item>
      ))}
    </Wrapper>
  );
};

export default Timeline;