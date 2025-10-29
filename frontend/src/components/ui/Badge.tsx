import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: React.ReactNode;
  dot?: boolean;
  outline?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  outline = false,
  removable = false,
  onRemove,
}) => {
  const baseClasses = 'badge';
  const variantClasses = `badge--${variant}`;
  const sizeClasses = `badge--${size}`;
  const dotClasses = dot ? 'badge--dot' : '';
  const outlineClasses = outline ? 'badge--outline' : '';
  const removableClasses = removable ? 'badge--removable' : '';

  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    dotClasses,
    outlineClasses,
    removableClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {dot && <span className="badge__dot" />}
      <span className="badge__content">{children}</span>
      {removable && onRemove && (
        <button
          className="badge__remove"
          onClick={onRemove}
          aria-label="Remover"
          type="button"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Badge;