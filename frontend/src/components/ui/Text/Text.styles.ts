import styled, { css } from 'styled-components';

interface TextProps {
  children: React.ReactNode;
  variant?: 'body1' | 'body2' | 'caption' | 'overline' | 'subtitle1' | 'subtitle2';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' | 'success' | 'warning' | 'error';
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  truncate?: boolean;
  className?: string;
  as?: React.ElementType;
}

// Estilos de variantes tipográficas
const variantStyles = {
  body1: css`
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  `,
  
  body2: css`
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  `,
  
  caption: css`
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  `,
  
  overline: css`
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  
  subtitle1: css`
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  `,
  
  subtitle2: css`
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  `,
};

// Estilos de tamanhos
const sizeStyles = {
  xs: css`
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  `,
  
  sm: css`
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  `,
  
  base: css`
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  `,
  
  lg: css`
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  `,
  
  xl: css`
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  `,
  
  '2xl': css`
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  `,
  
  '3xl': css`
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  `,
};

// Estilos de peso da fonte
const weightStyles = {
  light: css`
    font-weight: ${({ theme }) => theme.typography.fontWeight.light};
  `,
  
  normal: css`
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  `,
  
  medium: css`
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  `,
  
  semibold: css`
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  `,
  
  bold: css`
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  `,
};

// Estilos de cores
const colorStyles = {
  primary: css`
    color: ${({ theme }) => theme.colors.text.primary};
  `,
  
  secondary: css`
    color: ${({ theme }) => theme.colors.text.secondary};
  `,
  
  tertiary: css`
    color: ${({ theme }) => theme.colors.text.tertiary};
  `,
  
  disabled: css`
    color: ${({ theme }) => theme.colors.text.disabled};
  `,
  
  inverse: css`
    color: ${({ theme }) => theme.colors.text.inverse};
  `,
  
  success: css`
    color: ${({ theme }) => theme.colors.success.main};
  `,
  
  warning: css`
    color: ${({ theme }) => theme.colors.warning.main};
  `,
  
  error: css`
    color: ${({ theme }) => theme.colors.error.main};
  `,
};

// Estilos de alinhamento
const alignStyles = {
  left: css`
    text-align: left;
  `,
  
  center: css`
    text-align: center;
  `,
  
  right: css`
    text-align: right;
  `,
  
  justify: css`
    text-align: justify;
  `,
};

// Estilos de transformação de texto
const transformStyles = {
  none: css`
    text-transform: none;
  `,
  
  uppercase: css`
    text-transform: uppercase;
  `,
  
  lowercase: css`
    text-transform: lowercase;
  `,
  
  capitalize: css`
    text-transform: capitalize;
  `,
};

export const StyledText = styled.span<TextProps>`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  margin: 0;
  
  /* Aplicar estilos de variante */
  ${({ variant }) => variant && variantStyles[variant]}
  
  /* Aplicar estilos de tamanho (sobrescreve variante se especificado) */
  ${({ size }) => size && sizeStyles[size]}
  
  /* Aplicar estilos de peso */
  ${({ weight }) => weight && weightStyles[weight]}
  
  /* Aplicar estilos de cor */
  ${({ color = 'primary' }) => colorStyles[color]}
  
  /* Aplicar estilos de alinhamento */
  ${({ align }) => align && alignStyles[align]}
  
  /* Aplicar estilos de transformação */
  ${({ transform }) => transform && transformStyles[transform]}
  
  /* Truncar texto se especificado */
  ${({ truncate }) => truncate && css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}
`;