import React from 'react';
import styled from 'styled-components';

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const Bar = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

export const Footer: React.FC<FooterProps> = ({ left, right, children, ...props }) => {
  return (
    <Bar {...props}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {left}
        {children}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {right}
      </div>
    </Bar>
  );
};

export default Footer;