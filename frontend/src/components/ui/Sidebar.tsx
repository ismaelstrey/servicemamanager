import React from 'react';
import styled from 'styled-components';

export interface SidebarItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  active?: boolean;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarItem[];
  onItemSelect?: (index: number, item: SidebarItem) => void;
  width?: number | string;
}

const Aside = styled.aside<{ width?: number | string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  width: ${({ width }) => (width !== undefined ? width : '240px')};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const Item = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  cursor: pointer;
  border: 1px solid transparent;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  &:hover { background: ${({ theme }) => theme.colors.background.tertiary}; }
  ${({ active, theme }) => active && `border-color: ${theme.colors.primary.main};`}
`;

export const Sidebar: React.FC<SidebarProps> = ({ items, onItemSelect, width, ...props }) => {
  return (
    <Aside width={width} {...props}>
      {items.map((it, i) => (
        <Item key={i} active={it.active} onClick={() => onItemSelect?.(i, it)}>
          {it.icon}
          <span>{it.label}</span>
        </Item>
      ))}
    </Aside>
  );
};

export default Sidebar;