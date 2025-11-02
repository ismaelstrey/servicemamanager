import React from 'react';
import styled from 'styled-components';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  heading?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.heading.h5.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h5.fontWeight};
  line-height: ${({ theme }) => theme.typography.heading.h5.lineHeight};
`;

export const Header: React.FC<HeaderProps> = ({ heading, left, right, children, ...props }) => {
  return (
    <Bar {...props}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {left}
        {heading && <Title>{heading}</Title>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {children}
        {right}
      </div>
    </Bar>
  );
};

export default Header;