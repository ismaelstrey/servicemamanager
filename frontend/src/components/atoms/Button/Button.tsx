import type React from 'react'
import styled, { css } from 'styled-components'

// Tipos para as props do Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

// Styled component para o botão
const StyledButton = styled.button<ButtonProps>`
  /* Reset básico */
  border: none;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  position: relative;
  overflow: hidden;
  
  /* Transições */
  transition: ${({ theme }) => theme.animations.transition.interactive};
  
  /* Estados de foco */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
  
  /* Estado desabilitado */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    pointer-events: none;
  }
  
  /* Largura total */
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  /* Tamanhos */
  ${({ size, theme }) => {
    switch (size) {
      case 'xs':
        return css`
          padding: ${theme.spacing.component.button.xs};
          font-size: ${theme.typography.fontSize.xs};
          border-radius: ${theme.borders.radius.sm};
        `
      case 'sm':
        return css`
          padding: ${theme.spacing.component.button.sm};
          font-size: ${theme.typography.fontSize.sm};
          border-radius: ${theme.borders.radius.sm};
        `
      case 'lg':
        return css`
          padding: ${theme.spacing.component.button.lg};
          font-size: ${theme.typography.fontSize.lg};
          border-radius: ${theme.borders.radius.md};
        `
      case 'xl':
        return css`
          padding: ${theme.spacing.component.button.xl};
          font-size: ${theme.typography.fontSize.xl};
          border-radius: ${theme.borders.radius.md};
        `
      default: // md
        return css`
          padding: ${theme.spacing.component.button.md};
          font-size: ${theme.typography.fontSize.base};
          border-radius: ${theme.borders.radius.md};
        `
    }
  }}
  
  /* Variantes */
  ${({ variant, theme }) => {
    switch (variant) {
      case 'secondary':
        return css`
          background-color: ${theme.colors.secondary.main};
          color: ${theme.colors.secondary.contrast};
          box-shadow: ${theme.shadows.component.button.default};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondary.dark};
            box-shadow: ${theme.shadows.component.button.hover};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.secondary.darker};
            box-shadow: ${theme.shadows.component.button.active};
            transform: translateY(0);
          }
        `
      case 'outline':
        return css`
          background-color: transparent;
          color: ${theme.colors.primary.main};
          border: ${theme.borders.width.medium} solid ${theme.colors.primary.main};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary.main};
            color: ${theme.colors.primary.contrast};
            box-shadow: ${theme.shadows.component.button.hover};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.primary.dark};
            border-color: ${theme.colors.primary.dark};
          }
        `
      case 'ghost':
        return css`
          background-color: transparent;
          color: ${theme.colors.text.primary};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.background.secondary};
            color: ${theme.colors.primary.main};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.background.tertiary};
          }
        `
      case 'danger':
        return css`
          background-color: ${theme.colors.danger.main};
          color: ${theme.colors.danger.contrast};
          box-shadow: ${theme.shadows.component.button.default};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.danger.dark};
            box-shadow: ${theme.shadows.component.button.hover};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.danger.darker};
            box-shadow: ${theme.shadows.component.button.active};
            transform: translateY(0);
          }
        `
      default: // primary
        return css`
          background-color: ${theme.colors.primary.main};
          color: ${theme.colors.primary.contrast};
          box-shadow: ${theme.shadows.component.button.default};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary.dark};
            box-shadow: ${theme.shadows.component.button.hover};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.primary.darker};
            box-shadow: ${theme.shadows.component.button.active};
            transform: translateY(0);
          }
        `
    }
  }}
`

// Componente de loading spinner
const LoadingSpinner = styled.div`
  width: 1em;
  height: 1em;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: ${({ theme }) => theme.animations.keyframes.spin} 1s linear infinite;
`

// Componente Button principal
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          {children}
        </>
      ) : (
        <>
          {leftIcon && <span>{leftIcon}</span>}
          {children}
          {rightIcon && <span>{rightIcon}</span>}
        </>
      )}
    </StyledButton>
  )
}

export default Button