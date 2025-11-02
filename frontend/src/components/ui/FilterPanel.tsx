import React from 'react';
import styled from 'styled-components';

export interface FilterPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
}

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: ${({ theme }) => theme.spacing.md};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.ui.subtitle.fontWeight};
`;

export const FilterPanel: React.FC<FilterPanelProps> = ({ title, children, ...props }) => {
  return (
    <Panel {...props}>
      {title && <Header>{title}</Header>}
      {children}
    </Panel>
  );
};

export default FilterPanel;