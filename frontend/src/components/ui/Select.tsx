import React, { forwardRef } from 'react';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'default' | 'filled' | 'outlined';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: SelectSize;
  variant?: SelectVariant;
  fullWidth?: boolean;
  placeholder?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  placeholder,
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'select';
  const sizeClasses = `select--${size}`;
  const variantClasses = `select--${variant}`;
  const fullWidthClasses = fullWidth ? 'select--full' : '';
  const errorClasses = error ? 'select--error' : '';
  const disabledClasses = props.disabled ? 'select--disabled' : '';

  const selectClasses = [
    baseClasses,
    sizeClasses,
    variantClasses,
    fullWidthClasses,
    errorClasses,
    disabledClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="select-wrapper">
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {props.required && <span className="select-required">*</span>}
        </label>
      )}
      
      <div className="select-container">
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <div className="select-icon">
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {(error || helperText) && (
        <div className="select-feedback">
          {error && <span className="select-error-text">{error}</span>}
          {!error && helperText && <span className="select-helper-text">{helperText}</span>}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

export type { SelectProps };