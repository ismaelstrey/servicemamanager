import React from 'react';

export type AlertVariant = 'success' | 'danger' | 'warning' | 'info';
export type AlertSize = 'sm' | 'md' | 'lg';

interface AlertProps {
  children: React.ReactNode;
  variant: AlertVariant;
  size?: AlertSize;
  className?: string;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

const defaultIcons = {
  success: '✓',
  danger: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const Alert: React.FC<AlertProps> = ({
  children,
  variant,
  size = 'md',
  className = '',
  title,
  dismissible = false,
  onDismiss,
  icon,
}) => {
  const baseClasses = 'alert';
  const variantClasses = `alert--${variant}`;
  const sizeClasses = `alert--${size}`;
  const dismissibleClasses = dismissible ? 'alert--dismissible' : '';

  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    dismissibleClasses,
    className,
  ].filter(Boolean).join(' ');

  const alertIcon = icon || defaultIcons[variant];

  return (
    <div className={classes} role="alert">
      <div className="alert__content">
        {alertIcon && (
          <div className="alert__icon">
            {alertIcon}
          </div>
        )}
        <div className="alert__body">
          {title && (
            <div className="alert__title">
              {title}
            </div>
          )}
          <div className="alert__message">
            {children}
          </div>
        </div>
      </div>
      {dismissible && onDismiss && (
        <button
          className="alert__dismiss"
          onClick={onDismiss}
          aria-label="Fechar alerta"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;