import React from 'react';
import styled, { css, keyframes } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' | 'link' |'accent'|'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const spin = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`;

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth?: boolean;
  $loading?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  border: 1px solid transparent;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.transition.fast};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}

  ${({ $size, theme }) => {
    switch ($size) {
      case 'sm':
        return css`padding: ${theme.spacing.xs} ${theme.spacing.sm}; font-size: ${theme.typography.fontSize.sm};`;
      case 'lg':
        return css`padding: ${theme.spacing.md} ${theme.spacing.lg}; font-size: ${theme.typography.fontSize.lg};`;
      default:
        return css`padding: ${theme.spacing.sm} ${theme.spacing.md}; font-size: ${theme.typography.fontSize.base};`;
    }
  }}

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'secondary':
        return css`
          background: ${theme.colors.surface};
          color: ${theme.colors.text.primary};
          border-color: ${theme.colors.border.primary};
          &:hover { background: ${theme.colors.neutral[100]}; }
        `;
      case 'success':
        return css`
          background: ${theme.colors.success.main};
          color: ${theme.colors.text.inverse};
        `;
      case 'danger':
        return css`
          background: ${theme.colors.error.main};
          color: ${theme.colors.text.inverse};
        `;
      case 'warning':
        return css`
          background: ${theme.colors.warning.main};
          color: ${theme.colors.text.inverse};
        `;
      case 'info':
        return css`
          background: ${theme.colors.info.main};
          color: ${theme.colors.text.inverse};
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.text.primary};
          border-color: ${theme.colors.border.primary};
        `;
      case 'link':
        return css`
          background: transparent;
          color: ${theme.colors.primary.main};
          text-decoration: underline;
          border-color: transparent;
        `;
      case 'accent':
        return css`
          background: ${theme.colors.primary.main};
          color: ${theme.colors.text.inverse};
        `;
      case 'outline':
        return css`
          background: transparent;
          color: ${theme.colors.primary.main};
          border-color: ${theme.colors.primary.main};
        `;
      default:
        return css`
          background: ${theme.colors.primary.main};
          color: ${theme.colors.text.inverse};
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: ${spin} 0.8s linear infinite;
`;

const Icon = styled.span<{ $pos: 'left' | 'right' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ $pos }) => $pos === 'left' ? css`margin-right: 4px;` : css`margin-left: 4px;`}
`;

const Content = styled.span``;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      className={className}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {!loading && leftIcon && <Icon $pos="left">{leftIcon}</Icon>}
      <Content>{children}</Content>
      {!loading && rightIcon && <Icon $pos="right">{rightIcon}</Icon>}
    </StyledButton>
  );
};

export default Button;