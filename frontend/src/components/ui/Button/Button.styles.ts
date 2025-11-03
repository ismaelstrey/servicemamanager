import styled, { css, keyframes } from 'styled-components';
import type { StyledButtonProps } from './Button.types';

// Animação de loading
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Estilos de variantes
const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.contrast};
    border: 1px solid ${({ theme }) => theme.colors.primary.main};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary.dark};
      border-color: ${({ theme }) => theme.colors.primary.dark};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
  `,
  
  secondary: css`
    background-color: ${({ theme }) => theme.colors.secondary.main};
    color: ${({ theme }) => theme.colors.secondary.contrast};
    border: 1px solid ${({ theme }) => theme.colors.secondary.main};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.secondary.dark};
      border-color: ${({ theme }) => theme.colors.secondary.dark};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
  `,

  outline: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.primary.main};
    border: 1px solid ${({ theme }) => theme.colors.primary.main};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary.main};
      color: ${({ theme }) => theme.colors.primary.contrast};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
  `,

  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background-color: transparent;
      color: ${({ theme }) => theme.colors.text.secondary};
    }

    &:active:not(:disabled) {
      background-color: transparent;
      color: ${({ theme }) => theme.colors.primary.main};
    }
  `,

  danger: css`
    background-color: ${({ theme }) => theme.colors.error.main};
    color: ${({ theme }) => theme.colors.error.contrast};
    border: 1px solid ${({ theme }) => theme.colors.error.main};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.error.dark};
      border-color: ${({ theme }) => theme.colors.error.dark};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
  `,

  success: css`
    background-color: ${({ theme }) => theme.colors.success.main};
    color: ${({ theme }) => theme.colors.success.contrast};
    border: 1px solid ${({ theme }) => theme.colors.success.main};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.success.dark};
      border-color: ${({ theme }) => theme.colors.success.dark};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
  `,

  warning: css`
    background-color: ${({ theme }) => theme.colors.warning.main};
    color: ${({ theme }) => theme.colors.warning.contrast};
    border: 1px solid ${({ theme }) => theme.colors.warning.main};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.warning.dark};
      border-color: ${({ theme }) => theme.colors.warning.dark};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
  `,
};

// Estilos de tamanhos
const sizeStyles = {
  small: css`
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    min-height: 32px;
  `,
  
  medium: css`
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    min-height: 40px;
  `,
  
  large: css`
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    min-height: 48px;
  `,
};

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.duration.fast} ${({ theme }) => theme.animations.easing.easeInOut};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-decoration: none;
  outline: none;
  position: relative;
  overflow: hidden;

  /* Aplicar estilos de variante */
  ${({ variant = 'primary' }) => variantStyles[variant as keyof typeof variantStyles]}
  
  /* Aplicar estilos de tamanho */
  ${({ size = 'medium' }) => sizeStyles[size as keyof typeof sizeStyles]}

  /* Estado de largura total */
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}

  /* Estado desabilitado */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  /* Estado de loading */
  ${({ loading }) => loading && css`
    cursor: not-allowed;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 16px;
      margin: -8px 0 0 -8px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: ${spin} 1s linear infinite;
    }
  `}

  /* Focus visible para acessibilidade */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

export const ButtonIcon = styled.span<{ position: 'left' | 'right' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  ${({ position }) => position === 'left' && css`
    margin-right: ${({ theme }) => theme.spacing.xs};
  `}
  
  ${({ position }) => position === 'right' && css`
    margin-left: ${({ theme }) => theme.spacing.xs};
  `}
`;

export const ButtonContent = styled.span<{ loading?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  ${({ loading }) => loading && css`
    opacity: 0;
  `}
`;