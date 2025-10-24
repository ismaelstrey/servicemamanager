import React, { useState, useRef, useEffect } from 'react';

export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

interface DropdownProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  placement?: DropdownPlacement;
  className?: string;
  disabled?: boolean;
  closeOnClick?: boolean;
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  href?: string;
  target?: string;
}

interface DropdownDividerProps {
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  children,
  trigger,
  placement = 'bottom-start',
  className = '',
  disabled = false,
  closeOnClick = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div ref={dropdownRef} className={classes}>
      <button
        ref={triggerRef}
        className="dropdown__trigger"
        onClick={handleTriggerClick}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        {trigger}
      </button>
      {isOpen && (
        <div className="dropdown__menu" onClick={handleItemClick}>
          {children}
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