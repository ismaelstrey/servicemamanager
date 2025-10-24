import React from 'react'
import styled, { css } from 'styled-components'

// Tipos para as props do Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  children: React.ReactNode
}

// Styled component para o card
const StyledCard = styled.div<CardProps>`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  transition: ${({ theme }) => theme.animations.transition.interactive};
  position: relative;
  overflow: hidden;
  
  /* Cursor interativo */
  ${({ interactive }) => interactive && css`
    cursor: pointer;
  `}
  
  /* Variantes */
  ${({ variant, theme, interactive }) => {
    switch (variant) {
      case 'outlined':
        return css`
          background-color: ${theme.colors.background.primary};
          border: ${theme.borders.width.sm} solid ${theme.colors.border.primary};
          
          ${interactive && css`
            &:hover {
              border-color: ${theme.colors.border.secondary};
              box-shadow: ${theme.shadows.elevation.sm};
            }
            
            &:active {
              transform: translateY(1px);
            }
          `}
        `
      case 'elevated':
        return css`
          background-color: ${theme.colors.background.primary};
          box-shadow: ${theme.shadows.elevation.md};
          border: none;
          
          ${interactive && css`
            &:hover {
              box-shadow: ${theme.shadows.elevation.lg};
              transform: translateY(-2px);
            }
            
            &:active {
              box-shadow: ${theme.shadows.elevation.sm};
              transform: translateY(0);
            }
          `}
        `
      case 'filled':
        return css`
          background-color: ${theme.colors.background.secondary};
          border: none;
          
          ${interactive && css`
            &:hover {
              background-color: ${theme.colors.background.tertiary};
              box-shadow: ${theme.shadows.elevation.sm};
            }
            
            &:active {
              transform: translateY(1px);
            }
          `}
        `
      default: // default
        return css`
          background-color: ${theme.colors.background.primary};
          box-shadow: ${theme.shadows.elevation.sm};
          border: none;
          
          ${interactive && css`
            &:hover {
              box-shadow: ${theme.shadows.elevation.md};
              transform: translateY(-1px);
            }
            
            &:active {
              box-shadow: ${theme.shadows.elevation.xs};
              transform: translateY(0);
            }
          `}
        `
    }
  }}
  
  /* Tamanhos (afeta principalmente o border-radius) */
  ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return css`
          border-radius: ${theme.borders.radius.md};
        `
      case 'lg':
        return css`
          border-radius: ${theme.borders.radius.xl};
        `
      default: // md
        return css`
          border-radius: ${theme.borders.radius.lg};
        `
    }
  }}
  
  /* Padding */
  ${({ padding, theme }) => {
    switch (padding) {
      case 'none':
        return css`
          padding: 0;
        `
      case 'sm':
        return css`
          padding: ${theme.spacing.sm};
        `
      case 'lg':
        return css`
          padding: ${theme.spacing.lg};
        `
      case 'xl':
        return css`
          padding: ${theme.spacing.xl};
        `
      default: // md
        return css`
          padding: ${theme.spacing.md};
        `
    }
  }}
  
  /* Estados de foco para cards interativos */
  ${({ interactive, theme }) => interactive && css`
    &:focus-visible {
      outline: 2px solid ${theme.colors.primary.main};
      outline-offset: 2px;
    }
  `}
`

// Componentes auxiliares para estruturar o card
export const CardHeader = styled.div<{ padding?: CardProps['padding'] }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  
  ${({ padding, theme }) => {
    if (padding === 'none') return ''
    
    const paddingValue = padding === 'sm' ? theme.spacing.sm :
                        padding === 'lg' ? theme.spacing.lg :
                        padding === 'xl' ? theme.spacing.xl :
                        theme.spacing.md
    
    return css`
      padding: ${paddingValue} ${paddingValue} 0 ${paddingValue};
    `
  }}
`

export const CardBody = styled.div<{ padding?: CardProps['padding'] }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  
  ${({ padding, theme }) => {
    if (padding === 'none') return ''
    
    const paddingValue = padding === 'sm' ? theme.spacing.sm :
                        padding === 'lg' ? theme.spacing.lg :
                        padding === 'xl' ? theme.spacing.xl :
                        theme.spacing.md
    
    return css`
      padding: ${paddingValue};
    `
  }}
`

export const CardFooter = styled.div<{ padding?: CardProps['padding'] }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  
  ${({ padding, theme }) => {
    if (padding === 'none') return ''
    
    const paddingValue = padding === 'sm' ? theme.spacing.sm :
                        padding === 'lg' ? theme.spacing.lg :
                        padding === 'xl' ? theme.spacing.xl :
                        theme.spacing.md
    
    return css`
      padding: 0 ${paddingValue} ${paddingValue} ${paddingValue};
    `
  }}
`

export const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.heading.h4.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h4.fontWeight};
  line-height: ${({ theme }) => theme.typography.heading.h4.lineHeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`

export const CardSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.ui.sm.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`

export const CardDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.body.base.fontSize};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`

// Componente Card principal
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'md',
  padding = 'md',
  interactive = false,
  children,
  tabIndex,
  ...props
}) => {
  return (
    <StyledCard
      variant={variant}
      size={size}
      padding={padding}
      interactive={interactive}
      tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
      {...props}
    >
      {children}
    </StyledCard>
  )
}

export default Card