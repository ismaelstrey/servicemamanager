import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  label?: string;
  centered?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className = '',
  label,
  centered = false,
}) => {
  const baseClasses = 'spinner';
  const sizeClasses = `spinner--${size}`;
  const variantClasses = `spinner--${variant}`;
  const centeredClasses = centered ? 'spinner--centered' : '';

  const classes = [
    baseClasses,
    sizeClasses,
    variantClasses,
    centeredClasses,
    className,
  ].filter(Boolean).join(' ');

  const spinnerElement = (
    <div
      className={classes}
      role="status"
      aria-label={label || 'Carregando...'}
    >
      <div className="spinner__circle" />
      {label && <span className="spinner__label">{label}</span>}
    </div>
  );

  if (centered) {
    return (
      <div className="spinner-container">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default Spinner;