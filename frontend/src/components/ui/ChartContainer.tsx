import React from 'react';
import styled from 'styled-components';

export interface ChartContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  actions?: React.ReactNode;
}

const Wrapper = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, actions, children, ...props }) => {
  return (
    <Wrapper {...props}>
      {(title || actions) && (
        <Header>
          <div>{title}</div>
          <div>{actions}</div>
        </Header>
      )}
      <Body>{children}</Body>
    </Wrapper>
  );
};

export default ChartContainer;