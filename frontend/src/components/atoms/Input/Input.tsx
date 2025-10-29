import type React from 'react'
import { forwardRef } from 'react'
import styled, { css } from 'styled-components'

// Tipos para as props do Input
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'flushed'
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  errorMessage?: string
  label?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

// Container principal do input
const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
`

// Label do input
const InputLabel = styled.label<{ error?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, error }) =>
    error ? theme.colors.error.main : theme.colors.text.primary
  };
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`

// Wrapper para o input com ícones
const InputWrapper = styled.div<{
  hasLeftIcon?: boolean
  hasRightIcon?: boolean
  error?: boolean
  variant?: InputProps['variant']
  size?: InputProps['size']
}>`
  position: relative;
  display: flex;
  align-items: center;
  
  ${({ variant, theme, error }) => {
    switch (variant) {
      case 'filled':
        return css`
          background-color: ${theme.colors.background.secondary};
          border: ${theme.borders.width.thin} solid transparent;
          border-radius: ${theme.borders.radius.md};
          
          &:focus-within {
            background-color: ${theme.colors.background.primary};
            border-color: ${error ? theme.colors.error.main : theme.colors.primary.main};
            box-shadow: ${error ? theme.shadows.focus.danger : theme.shadows.focus.primary};
          }
        `
      case 'flushed':
        return css`
          background-color: transparent;
          border: none;
          border-bottom: ${theme.borders.width.medium} solid ${error ? theme.colors.error.main : theme.colors.border.primary
          };
          border-radius: 0;
          
          &:focus-within {
            border-bottom-color: ${error ? theme.colors.error.main : theme.colors.primary.main};
          }
        `
      default: // default
        return css`
          background-color: ${theme.colors.background.primary};
          border: ${theme.borders.width.thin} solid ${error ? theme.colors.error.main : theme.colors.border.primary
          };
          border-radius: ${theme.borders.radius.md};
          
          &:focus-within {
            border-color: ${error ? theme.colors.error.main : theme.colors.primary.main};
            box-shadow: ${error ? theme.shadows.focus.danger : theme.shadows.focus.primary};
          }
          
          &:hover:not(:focus-within) {
            border-color: ${error ? theme.colors.error.main : theme.colors.border.secondary};
          }
        `
    }
  }}
  
  ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return css`
          padding: ${theme.spacing.component.input.sm};
        `
      case 'lg':
        return css`
          padding: ${theme.spacing.component.input.lg};
        `
      default: // md
        return css`
          padding: ${theme.spacing.component.input.md};
        `
    }
  }}
  
  transition: ${({ theme }) => theme.animations.transition.interactive};
`

// Input styled
const StyledInput = styled.input<{
  hasLeftIcon?: boolean
  hasRightIcon?: boolean
  size?: InputProps['size']
}>`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  
  ${({ size, theme, hasLeftIcon, hasRightIcon }) => {
    switch (size) {
      case 'sm':
        return css`
          font-size: ${theme.typography.fontSize.sm};
          padding-left: ${hasLeftIcon ? theme.spacing[6] : '0'};
          padding-right: ${hasRightIcon ? theme.spacing[6] : '0'};
        `
      case 'lg':
        return css`
          font-size: ${theme.typography.fontSize.lg};
          padding-left: ${hasLeftIcon ? theme.spacing[8] : '0'};
          padding-right: ${hasRightIcon ? theme.spacing[8] : '0'};
        `
      default: // md
        return css`
          font-size: ${theme.typography.fontSize.base};
          padding-left: ${hasLeftIcon ? theme.spacing[7] : '0'};
          padding-right: ${hasRightIcon ? theme.spacing[7] : '0'};
        `
    }
  }}
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`

// Container para ícones
const IconContainer = styled.div<{
  position: 'left' | 'right'
  size?: InputProps['size']
}>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  pointer-events: none;
  z-index: 1;
  
  ${({ position, size, theme }) => {
    const iconSize = size === 'sm' ? theme.spacing[4] : size === 'lg' ? theme.spacing[6] : theme.spacing[5]
    const offset = size === 'sm' ? theme.spacing[2] : size === 'lg' ? theme.spacing[3] : theme.spacing[3]

    return css`
      width: ${iconSize};
      height: ${iconSize};
      ${position}: ${offset};
    `
  }}
`

// Texto de ajuda/erro
const HelperText = styled.div<{ error?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme, error }) =>
    error ? theme.colors.error.main : theme.colors.text.secondary
  };
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`

// Componente Input principal
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'md',
  error = false,
  errorMessage,
  label,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}, ref) => {
  const hasLeftIcon = Boolean(leftIcon)
  const hasRightIcon = Boolean(rightIcon)
  const displayHelperText = error ? errorMessage : helperText

  return (
    <InputContainer fullWidth={fullWidth}>
      {label && (
        <InputLabel error={error} htmlFor={props.id}>
          {label}
        </InputLabel>
      )}

      <InputWrapper
        variant={variant}
        size={size}
        error={error}
        hasLeftIcon={hasLeftIcon}
        hasRightIcon={hasRightIcon}
      >
        {leftIcon && (
          <IconContainer position="left" size={size}>
            {leftIcon}
          </IconContainer>
        )}

        <StyledInput
          ref={ref}
          size={size}
          hasLeftIcon={hasLeftIcon}
          hasRightIcon={hasRightIcon}
          {...props}
        />

        {rightIcon && (
          <IconContainer position="right" size={size}>
            {rightIcon}
          </IconContainer>
        )}
      </InputWrapper>

      {displayHelperText && (
        <HelperText error={error}>
          {displayHelperText}
        </HelperText>
      )}
    </InputContainer>
  )
})

Input.displayName = 'Input'

export default Input