import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export interface StyledInputProps extends Omit<InputProps, 'size'> {
  hasError?: boolean;
  hasLeftIcon?: boolean;
  hasRightIcon?: boolean;
  hasLeftAddon?: boolean;
  hasRightAddon?: boolean;
  inputSize?: 'small' | 'medium' | 'large';
}