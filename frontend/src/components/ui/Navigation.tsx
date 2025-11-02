import React from 'react';
import styled from 'styled-components';

export interface NavItem {
  label: React.ReactNode;
  href?: string;
  active?: boolean;
}

export interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  items: NavItem[];
  onItemSelect?: (index: number, item: NavItem) => void;
}

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Link = styled.button<{ active?: boolean }>`
  background: transparent;
  border: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.xs};
  border-bottom: 2px solid transparent;
  ${({ active, theme }) => active && `color: ${theme.colors.text.primary}; border-bottom-color: ${theme.colors.primary.main};`}
`;

export const Navigation: React.FC<NavigationProps> = ({ items, onItemSelect, ...props }) => {
  return (
    <Nav {...props}>
      {items.map((it, i) => (
        <Link key={i} active={it.active} onClick={() => onItemSelect?.(i, it)}>
          {it.label}
        </Link>
      ))}
    </Nav>
  );
};

export default Navigation;