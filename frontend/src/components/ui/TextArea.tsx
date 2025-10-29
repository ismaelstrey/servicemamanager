import React, { forwardRef } from 'react';

export type TextAreaSize = 'sm' | 'md' | 'lg';
export type TextAreaVariant = 'default' | 'filled' | 'outlined';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: TextAreaSize;
  variant?: TextAreaVariant;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  resize = 'vertical',
  className = '',
  id,
  rows = 3,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'textarea';
  const sizeClasses = `textarea--${size}`;
  const variantClasses = `textarea--${variant}`;
  const fullWidthClasses = fullWidth ? 'textarea--full' : '';
  const errorClasses = error ? 'textarea--error' : '';
  const disabledClasses = props.disabled ? 'textarea--disabled' : '';
  const resizeClasses = `textarea--resize-${resize}`;

  const textareaClasses = [
    baseClasses,
    sizeClasses,
    variantClasses,
    fullWidthClasses,
    errorClasses,
    disabledClasses,
    resizeClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="textarea-wrapper">
      {label && (
        <label htmlFor={textareaId} className="textarea-label">
          {label}
          {props.required && <span className="textarea-required">*</span>}
        </label>
      )}
      
      <div className="textarea-container">
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          rows={rows}
          {...props}
        />
      </div>

      {(error || helperText) && (
        <div className="textarea-feedback">
          {error && <span className="textarea-error-text">{error}</span>}
          {!error && helperText && <span className="textarea-helper-text">{helperText}</span>}
        </div>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;

// (remove the conflicting re-export; TextAreaProps is already exported via the interface declaration)
