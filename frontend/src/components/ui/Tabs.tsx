import React, { useState, createContext, useContext } from 'react';
import styled, { css } from 'styled-components';

export type TabsVariant = 'default' | 'pills' | 'underline';
export type TabsSize = 'sm' | 'md' | 'lg';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant: TabsVariant;
  size: TabsSize;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  children: React.ReactNode;
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  className?: string;
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

interface TabPanelProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

const TabsRoot = styled.div<{ $variant: TabsVariant }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  ${({ $variant, theme }) => $variant === 'underline' && css`
    border-bottom: 1px solid ${theme.colors.border.primary};
    padding-bottom: ${theme.spacing.xs};
  `}
`;

const List = styled.div<{ $variant: TabsVariant }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TabButton = styled.button<{ $active?: boolean; $disabled?: boolean; $variant: TabsVariant; $size: TabsSize }>`
  appearance: none;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.animations.transition.color};

  ${({ $size, theme }) => {
    switch ($size) {
      case 'sm':
        return css`padding: ${theme.spacing.xs} ${theme.spacing.sm}; font-size: ${theme.typography.fontSize.sm};`;
      case 'lg':
        return css`padding: ${theme.spacing.md} ${theme.spacing.lg}; font-size: ${theme.typography.fontSize.lg};`;
      default:
        return css`padding: ${theme.spacing.sm} ${theme.spacing.md}; font-size: ${theme.typography.fontSize.base};`;
    }
  }}

  ${({ $variant, $active, theme }) => {
    if ($variant === 'pills') {
      return css`
        background-color: ${$active ? theme.colors.primary.main : (theme.mode === 'dark' ? theme.colors.alpha.white[10] : theme.colors.neutral[100])};
        color: ${$active ? theme.colors.primary.contrast : theme.colors.text.secondary};
        border-radius: ${theme.borders.radius.lg};
      `;
    }
    if ($variant === 'underline') {
      return css`
        border-bottom: 2px solid ${$active ? theme.colors.primary.main : 'transparent'};
        color: ${$active ? theme.colors.text.primary : theme.colors.text.secondary};
        border-radius: 0;
      `;
    }
    return css`
      background-color: ${$active ? (theme.mode === 'dark' ? theme.colors.alpha.white[10] : theme.colors.primary[50]) : 'transparent'};
      color: ${$active ? theme.colors.text.primary : theme.colors.text.secondary};
      ${$active ? css`border: 1px solid ${theme.colors.border.primary};` : ''}
    `;
  }}

  ${({ $disabled }) => $disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
  `}

  &:focus {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focus.primary};
  }
`;

const Panels = styled.div`
  display: block;
`;

const Panel = styled.div`
  display: block;
`;

export const Tabs: React.FC<TabsProps> = ({
  children,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || '');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = (tab: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tab);
    }
    onTabChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant, size }}>
      <TabsRoot className={className} $variant={variant}>
        {children}
      </TabsRoot>
    </TabsContext.Provider>
  );
};

export const TabList: React.FC<TabListProps> = ({
  children,
  className = '',
}) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabList must be used within Tabs');
  }
  const { variant } = context;
  return (
    <List className={className} role="tablist" $variant={variant}>
      {children}
    </List>
  );
};

export const Tab: React.FC<TabProps> = ({
  children,
  value,
  disabled = false,
  className = '',
}) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab must be used within Tabs');
  }
  const { activeTab, setActiveTab, variant, size } = context;
  const isActive = activeTab === value;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <TabButton
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      type="button"
      $active={isActive}
      $disabled={disabled}
      $variant={variant}
      $size={size}
    >
      {children}
    </TabButton>
  );
};

export const TabPanels: React.FC<TabPanelsProps> = ({
  children,
  className = '',
}) => {
  return <Panels className={className}>{children}</Panels>;
};

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  className = '',
}) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabPanel must be used within Tabs');
  }
  const { activeTab } = context;
  const isActive = activeTab === value;
  if (!isActive) {
    return null;
  }
  return (
    <Panel
      className={className}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      id={`tabpanel-${value}`}
    >
      {children}
    </Panel>
  );
};

export default Tabs;