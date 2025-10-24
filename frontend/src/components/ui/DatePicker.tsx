import React, { forwardRef } from 'react';

export type DatePickerSize = 'sm' | 'md' | 'lg';
export type DatePickerVariant = 'default' | 'filled' | 'outlined';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: DatePickerSize;
  variant?: DatePickerVariant;
  fullWidth?: boolean;
  showTime?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  showTime = false,
  className = '',
  id,
  ...props
}, ref) => {
  const datePickerId = id || `datepicker-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'datepicker';
  const sizeClasses = `datepicker--${size}`;
  const variantClasses = `datepicker--${variant}`;
  const fullWidthClasses = fullWidth ? 'datepicker--full' : '';
  const errorClasses = error ? 'datepicker--error' : '';
  const disabledClasses = props.disabled ? 'datepicker--disabled' : '';

  const datePickerClasses = [
    baseClasses,
    sizeClasses,
    variantClasses,
    fullWidthClasses,
    errorClasses,
    disabledClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="datepicker-wrapper">
      {label && (
        <label htmlFor={datePickerId} className="datepicker-label">
          {label}
          {props.required && <span className="datepicker-required">*</span>}
        </label>
      )}
      
      <div className="datepicker-container">
        <input
          ref={ref}
          id={datePickerId}
          type={showTime ? 'datetime-local' : 'date'}
          className={datePickerClasses}
          {...props}
        />
        <div className="datepicker-icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z"
              stroke="currentColor"
              strokeWidth="1.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.6667 1.33333V4"
              stroke="currentColor"
              strokeWidth="1.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.33333 1.33333V4"
              stroke="currentColor"
              strokeWidth="1.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 6.66667H14"
              stroke="currentColor"
              strokeWidth="1.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {(error || helperText) && (
        <div className="datepicker-feedback">
          {error && <span className="datepicker-error-text">{error}</span>}
          {!error && helperText && <span className="datepicker-helper-text">{helperText}</span>}
        </div>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;

export type { DatePickerProps };