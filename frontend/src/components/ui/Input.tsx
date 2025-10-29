import React, { forwardRef } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled' | 'outlined';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputSize;
  variant?: InputVariant;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  leftIcon,
  rightIcon,
  leftAddon,
  rightAddon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'input';
  const sizeClasses = `input--${size}`;
  const variantClasses = `input--${variant}`;
  const fullWidthClasses = fullWidth ? 'input--full' : '';
  const errorClasses = error ? 'input--error' : '';
  const disabledClasses = props.disabled ? 'input--disabled' : '';

  const inputClasses = [
    baseClasses,
    sizeClasses,
    variantClasses,
    fullWidthClasses,
    errorClasses,
    disabledClasses,
    className,
  ].filter(Boolean).join(' ');

  const hasAddons = leftAddon || rightAddon;
  const hasIcons = leftIcon || rightIcon;

  return (
    <div className={`input-group ${fullWidth ? 'input-group--full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      
      <div className={`input-wrapper ${hasAddons ? 'input-wrapper--addons' : ''} ${hasIcons ? 'input-wrapper--icons' : ''}`}>
        {leftAddon && (
          <div className="input-addon input-addon--left">
            {leftAddon}
          </div>
        )}
        
        {leftIcon && (
          <div className="input-icon input-icon--left">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="input-icon input-icon--right">
            {rightIcon}
          </div>
        )}
        
        {rightAddon && (
          <div className="input-addon input-addon--right">
            {rightAddon}
          </div>
        )}
      </div>
      
      {error && (
        <div className="input-error">
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div className="input-helper">
          {helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;