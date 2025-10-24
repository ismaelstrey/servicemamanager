import React from 'react';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';
export type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  className?: string;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  hoverable = false,
  clickable = false,
  onClick,
}) => {
  const baseClasses = 'card';
  const variantClasses = `card--${variant}`;
  const sizeClasses = `card--${size}`;
  const hoverableClasses = hoverable ? 'card--hoverable' : '';
  const clickableClasses = clickable ? 'card--clickable' : '';

  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    hoverableClasses,
    clickableClasses,
    className,
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={classes}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  actions,
}) => {
  return (
    <div className={`card-header ${className}`}>
      <div className="card-header__content">
        {children}
      </div>
      {actions && (
        <div className="card-header__actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  );
};

// Compound component pattern
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;