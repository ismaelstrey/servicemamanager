import React, { forwardRef } from 'react';
import BaseInput from './Input/Input';

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

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { size = 'md', variant = 'default', fullWidth = false, ...rest } = props;
  const mappedSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium';

  return (
    <BaseInput
      ref={ref}
      size={mappedSize as any}
      variant={variant as any}
      fullWidth={fullWidth}
      {...rest}
    />
  );
});

Input.displayName = 'Input';

export default Input;
