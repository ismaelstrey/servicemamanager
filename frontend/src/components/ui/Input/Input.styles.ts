import styled, { css } from 'styled-components';

// Container principal do input
export const InputContainer = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
`;

// Label do input
export const InputLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

// Wrapper do input com ícones e addons
export const InputWrapper = styled.div<{
  $hasLeftIcon?: boolean;
  $hasRightIcon?: boolean;
  $hasLeftAddon?: boolean;
  $hasRightAddon?: boolean;
  $hasError?: boolean;
  $variant?: 'default' | 'filled' | 'outlined';
}>`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  transition: all ${({ theme }) => theme.animations.duration.fast} ${({ theme }) => theme.animations.easing.easeInOut};

  ${({ $variant = 'default', theme, $hasError }) => {
    switch ($variant) {
      case 'filled':
        return css`
          background-color: ${theme.colors.neutral[100]};
          border: 1px solid transparent;
          
          &:focus-within {
            background-color: ${theme.colors.background.primary};
            border-color: ${$hasError ? theme.colors.error.main : theme.colors.primary.main};
            box-shadow: 0 0 0 3px ${$hasError ? theme.colors.error.main + '20' : theme.colors.primary.main + '20'};
          }
        `;
      case 'outlined':
        return css`
          background-color: transparent;
          border: 1px solid ${$hasError ? theme.colors.error.main : theme.colors.border.primary};
          
          &:focus-within {
            background-color: ${theme.mode === 'dark' ? theme.colors.background.tertiary : theme.colors.background.primary};
            border-color: ${$hasError ? theme.colors.error.main : theme.colors.primary.main};
            box-shadow: 0 0 0 3px ${$hasError ? theme.colors.error.main + '20' : theme.colors.primary.main + '20'};
          }
        `;
      default:
        return css`
          background-color: ${theme.colors.background.primary};
          border: 1px solid ${$hasError ? theme.colors.error.main : theme.colors.border.primary};
          
          &:focus-within {
            border-color: ${$hasError ? theme.colors.error.main : theme.colors.primary.main};
            box-shadow: 0 0 0 3px ${$hasError ? theme.colors.error.main + '20' : theme.colors.primary.main + '20'};
          }
        `;
    }
  }}

  &:hover:not(:focus-within) {
    border-color: ${({ theme, $hasError }) => $hasError ? theme.colors.error.main : theme.colors.border.secondary};
  }
`;

// Estilos de tamanhos para o input
const inputSizeStyles = {
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

// Input principal
export const StyledInput = styled.input<{
  $hasError?: boolean;
  $hasLeftIcon?: boolean;
  $hasRightIcon?: boolean;
  $hasLeftAddon?: boolean;
  $hasRightAddon?: boolean;
  $inputSize?: 'small' | 'medium' | 'large';
}>`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  
  ${({ $inputSize = 'medium' }) => inputSizeStyles[$inputSize]}

  ${({ $hasLeftIcon, $hasLeftAddon, theme }) => ($hasLeftIcon || $hasLeftAddon) && css`
    padding-left: ${theme.spacing.xs};
  `}

  ${({ $hasRightIcon, $hasRightAddon, theme }) => ($hasRightIcon || $hasRightAddon) && css`
    padding-right: ${theme.spacing.xs};
  `}

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Remove autofill styles */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px ${({ theme }) => theme.colors.background.primary} inset;
    -webkit-text-fill-color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// Ícones do input
export const InputIcon = styled.span<{ $position: 'left' | 'right' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  ${({ $position, theme }) => $position === 'left' && css`
    padding-left: ${theme.spacing.sm};
    padding-right: ${theme.spacing.xs};
  `}
  
  ${({ $position, theme }) => $position === 'right' && css`
    padding-left: ${theme.spacing.xs};
    padding-right: ${theme.spacing.sm};
  `}
`;

// Addons do input
export const InputAddon = styled.span<{ $position: 'left' | 'right' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  white-space: nowrap;
  
  ${({ $position, theme }) => $position === 'left' && css`
    padding: ${theme.spacing.sm};
    border-right: 1px solid ${theme.colors.border.primary};
    border-radius: ${theme.borders.radius.md} 0 0 ${theme.borders.radius.md};
  `}
  
  ${({ $position, theme }) => $position === 'right' && css`
    padding: ${theme.spacing.sm};
    border-left: 1px solid ${theme.colors.border.primary};
    border-radius: 0 ${theme.borders.radius.md} ${theme.borders.radius.md} 0;
  `}
`;

// Texto de ajuda
export const HelperText = styled.span<{ $hasError?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme, $hasError }) => $hasError ? theme.colors.error.main : theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

// Texto de erro
export const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.error.main};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;