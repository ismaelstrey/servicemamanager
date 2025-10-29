import React, { useState, createContext, useContext } from 'react';

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

  const baseClasses = 'tabs';
  const variantClasses = `tabs--${variant}`;
  const sizeClasses = `tabs--${size}`;

  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant, size }}>
      <div className={classes}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabList: React.FC<TabListProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`tabs__list ${className}`} role="tablist">
      {children}
    </div>
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

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  const baseClasses = 'tabs__tab';
  const activeClasses = isActive ? 'tabs__tab--active' : '';
  const disabledClasses = disabled ? 'tabs__tab--disabled' : '';

  const classes = [
    baseClasses,
    activeClasses,
    disabledClasses,
    className,
  ].filter(Boolean).join(' ');

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
    <button
      className={classes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      type="button"
    >
      {children}
    </button>
  );
};

export const TabPanels: React.FC<TabPanelsProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`tabs__panels ${className}`}>
      {children}
    </div>
  );
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
    <div
      className={`tabs__panel ${className}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      id={`tabpanel-${value}`}
    >
      {children}
    </div>
  );
};



export default Tabs;