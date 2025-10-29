import styled, { css } from 'styled-components';
import type { StyledCardProps } from './Card.types';

// Estilos de variantes
const variantStyles = {
  default: css`
    background-color: ${({ theme }) => theme.colors.background.secondary};
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
    box-shadow: none;
  `,
  
  outlined: css`
    background-color: ${({ theme }) => theme.colors.background.secondary};
    border: 1px solid ${({ theme }) => theme.colors.border.secondary};
    box-shadow: none;
  `,
  
  elevated: css`
    background-color: ${({ theme }) => theme.colors.background.secondary};
    border: 1px solid transparent;
    box-shadow: ${({ theme }) => theme.shadows.md};
  `,
};

// Estilos de padding
const paddingStyles = {
  none: css`
    padding: 0;
  `,
  
  small: css`
    padding: ${({ theme }) => theme.spacing.sm};
  `,
  
  medium: css`
    padding: ${({ theme }) => theme.spacing.md};
  `,
  
  large: css`
    padding: ${({ theme }) => theme.spacing.lg};
  `,
};

export const StyledCard = styled.div<StyledCardProps>`
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  transition: all ${({ theme }) => theme.animations.duration.fast} ${({ theme }) => theme.animations.easing.easeInOut};
  overflow: hidden;
  
  /* Aplicar estilos de variante */
  ${({ variant = 'default' }) => variantStyles[variant]}
  
  /* Aplicar estilos de padding */
  ${({ padding = 'medium' }) => paddingStyles[padding]}

  /* Estado hoverable */
  ${({ hoverable, onClick }) => (hoverable || onClick) && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.lg};
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
  `}

  /* Focus visible para acessibilidade */
  ${({ onClick }) => onClick && css`
    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main};
      outline-offset: 2px;
    }
  `}
`;

export const CardHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  
  &:first-child {
    border-top-left-radius: ${({ theme }) => theme.borders.radius.lg};
    border-top-right-radius: ${({ theme }) => theme.borders.radius.lg};
  }
  
  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: ${({ theme }) => theme.borders.radius.lg};
    border-bottom-right-radius: ${({ theme }) => theme.borders.radius.lg};
  }
`;

export const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  flex: 1;
  
  &:first-child {
    border-top-left-radius: ${({ theme }) => theme.borders.radius.lg};
    border-top-right-radius: ${({ theme }) => theme.borders.radius.lg};
  }
  
  &:last-child {
    border-bottom-left-radius: ${({ theme }) => theme.borders.radius.lg};
    border-bottom-right-radius: ${({ theme }) => theme.borders.radius.lg};
  }
`;

export const CardFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  
  &:first-child {
    border-top: none;
    background-color: transparent;
    border-top-left-radius: ${({ theme }) => theme.borders.radius.lg};
    border-top-right-radius: ${({ theme }) => theme.borders.radius.lg};
  }
  
  &:last-child {
    border-bottom-left-radius: ${({ theme }) => theme.borders.radius.lg};
    border-bottom-right-radius: ${({ theme }) => theme.borders.radius.lg};
  }
`;