import React from 'react';
import styled, { keyframes, css } from 'styled-components';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  label?: string;
  centered?: boolean;
}

const spinKeyframes = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Centered = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 4rem;
`;

const Circle = styled.div<{ $size: SpinnerSize; $variant: SpinnerVariant }>`
  border: 2px solid ${({ theme }) => theme.colors.neutral[100]};
  border-top-color: ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
  animation: ${spinKeyframes} 1s linear infinite;

  ${({ $size }) => {
    switch ($size) {
      case 'xs':
        return css`width: 1rem; height: 1rem;`;
      case 'sm':
        return css`width: 1.25rem; height: 1.25rem;`;
      case 'lg':
        return css`width: 2rem; height: 2rem;`;
      case 'xl':
        return css`width: 2.5rem; height: 2.5rem;`;
      default:
        return css`width: 1.5rem; height: 1.5rem;`;
    }
  }}

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
      case 'default':
        return css`border-top-color: ${theme.colors.primary.main};`;
      case 'secondary':
        return css`border-top-color: ${theme.colors.secondary.main};`;
      case 'success':
        return css`border-top-color: ${theme.colors.success.main};`;
      case 'danger':
        return css`border-top-color: ${theme.colors.error.main};`;
      case 'warning':
        return css`border-top-color: ${theme.colors.warning.main};`;
      case 'info':
        return css`border-top-color: ${theme.colors.info.main};`;
      default:
        return css``;
    }
  }}
`;

const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className = '',
  label,
  centered = false,
}) => {
  const content = (
    <Container className={className} role="status" aria-label={label || 'Carregando...'}>
      <Circle $size={size} $variant={variant} />
      {label && <Label>{label}</Label>}
    </Container>
  );

  if (centered) {
    return <Centered>{content}</Centered>;
  }

  return content;
};

export default Spinner;