import React from 'react';
import styled from 'styled-components';

export interface TimelineItem {
  id: string;
  time?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TimelineItem[];
}

const Line = styled.div`
  position: relative;
  margin-left: 14px;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${({ theme }) => theme.colors.border.primary};
  }
`;

const Entry = styled.div`
  position: relative;
  margin-left: 14px;
  padding: ${({ theme }) => theme.spacing.sm} 0;
`;

const Dot = styled.span`
  position: absolute;
  left: -14px;
  top: 12px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.main};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Title = styled.div`
  font-weight: ${({ theme }) => theme.typography.ui.subtitle.fontWeight};
`;

const Desc = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.ui.body.fontSize};
`;

export const Timeline: React.FC<TimelineProps> = ({ items, ...props }) => {
  return (
    <Line {...props}>
      {items.map((it) => (
        <Entry key={it.id}>
          <Dot />
          {it.time && <small style={{ color: 'inherit' }}>{it.time}</small>}
          <Title>{it.title}</Title>
          {it.description && <Desc>{it.description}</Desc>}
        </Entry>
      ))}
    </Line>
  );
};

export default Timeline;