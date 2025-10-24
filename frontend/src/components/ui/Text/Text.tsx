import React from 'react';
import { StyledText } from './Text.styles';

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
  as?: keyof JSX.IntrinsicElements;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body1',
  size,
  weight,
  color = 'primary',
  align,
  transform,
  truncate = false,
  className,
  as = 'span',
  ...props
}) => {
  return (
    <StyledText
      as={as}
      variant={variant}
      size={size}
      weight={weight}
      color={color}
      align={align}
      transform={transform}
      truncate={truncate}
      className={className}
      {...props}
    >
      {children}
    </StyledText>
  );
};