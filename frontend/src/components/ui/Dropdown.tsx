import React, { useState, useRef, useEffect } from 'react';

export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

export interface DropdownProps {
  children: React.ReactNode;
  // trigger é opcional; se não fornecido, o primeiro filho é usado como trigger
  trigger?: React.ReactNode;
  placement?: DropdownPlacement;
  className?: string;
  disabled?: boolean;
  closeOnClick?: boolean;
}

export interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  href?: string;
  target?: string;
  // variante opcional para sinalizar estilos (ex.: danger)
  variant?: 'default' | 'danger' | 'warning' | 'info' | 'success';
}

export interface DropdownDividerProps {
  className?: string;
}

// Adiciona tipos para propriedades estáticas do componente composto
type DropdownComponent = React.FC<DropdownProps> & {
  Item: React.FC<DropdownItemProps>;
  Divider: React.FC<DropdownDividerProps>;
};

export const Dropdown: DropdownComponent = ({
  children,
  trigger,
  placement = 'bottom-start',
  className = '',
  disabled = false,
  closeOnClick = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = () => {
    if (closeOnClick) {
      setIsOpen(false);
    }
  };

  const baseClasses = 'dropdown';
  const openClasses = isOpen ? 'dropdown--open' : '';
  const disabledClasses = disabled ? 'dropdown--disabled' : '';
  const placementClasses = `dropdown--${placement}`;

  const classes = [
    baseClasses,
    openClasses,
    disabledClasses,
    placementClasses,
    className,
  ].filter(Boolean).join(' ');

  // Se trigger não for fornecido, usa o primeiro filho como trigger e o restante como itens
  const childArray = React.Children.toArray(children);
  const defaultTrigger = (
    <span aria-label="Abrir menu" title="Abrir menu">⋮</span>
  );
  let triggerNode = trigger ?? (childArray.length > 0 ? childArray[0] : null);
  let menuChildren: React.ReactNode = trigger ? children : childArray.slice(1);

  // Evita usar DropdownItem como trigger; usa trigger padrão e mantém todos os children como itens
  if (!trigger && React.isValidElement(triggerNode) && triggerNode.type === DropdownItem) {
    triggerNode = defaultTrigger;
    menuChildren = childArray;
  }

  return (
    <div ref={dropdownRef} className={classes}>
      <div
        ref={triggerRef}
        className="dropdown__trigger"
        onClick={handleTriggerClick}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTriggerClick();
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
      >
        {triggerNode ?? defaultTrigger}
      </div>
      {isOpen && (
        <div className="dropdown__menu" onClick={handleItemClick}>
          {menuChildren}
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  href,
  target,
}) => {
  const baseClasses = 'dropdown__item';
  const disabledClasses = disabled ? 'dropdown__item--disabled' : '';

  const classes = [
    baseClasses,
    disabledClasses,
    className,
  ].filter(Boolean).join(' ');

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.();
  };

  if (href) {
    return (
      <a
        href={href}
        target={target}
        className={classes}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classes}
      onClick={handleClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
};

export const DropdownDivider: React.FC<DropdownDividerProps> = ({
  className = '',
}) => {
  return <div className={`dropdown__divider ${className}`} />;
};

// Compound component pattern
Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;

export default Dropdown;