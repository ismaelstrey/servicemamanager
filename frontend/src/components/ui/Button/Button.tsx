import React from 'react';
import type { ButtonProps } from './Button.types';
import { StyledButton, ButtonIcon, ButtonContent } from './Button.styles';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      loading={loading}
      fullWidth={fullWidth}
      {...props}
    >
      <ButtonContent loading={loading}>
        {leftIcon && (
          <ButtonIcon position="left">
            {leftIcon}
          </ButtonIcon>
        )}
        {children}
        {rightIcon && (
          <ButtonIcon position="right">
            {rightIcon}
          </ButtonIcon>
        )}
      </ButtonContent>
    </StyledButton>
  );
};

export default Button;