import React, { useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  open: boolean;
  onClose?: () => void;
  duration?: number; // ms
  variant?: ToastVariant;
}

const slideIn = keyframes`
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const Container = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  z-index: ${({ theme }) => theme.zIndex.toast};
`;

const Card = styled.div<{ variant: ToastVariant }>`
  min-width: 280px;
  max-width: 360px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-left-width: 4px;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: ${slideIn} 200ms ease;
  color: ${({ theme }) => theme.colors.text.primary};

  ${({ theme, variant }) =>
    variant === 'success' && css`border-left-color: ${theme.colors.success.main};` ||
    variant === 'warning' && css`border-left-color: ${theme.colors.warning.main};` ||
    variant === 'error' && css`border-left-color: ${theme.colors.error.main};` ||
    css`border-left-color: ${theme.colors.info.main};`}
`;

const Title = styled.div`
  font-weight: ${({ theme }) => theme.typography.ui.subtitle.fontWeight};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Desc = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Toast: React.FC<ToastProps> = ({ open, onClose, duration = 3000, title, description, variant = 'info', ...props }) => {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => onClose?.(), duration);
    return () => window.clearTimeout(id);
  }, [open, onClose, duration]);

  if (!open) return null;

  return (
    <Container>
      <Card variant={variant} role="status" aria-live="polite" {...props}>
        {title && <Title>{title}</Title>}
        {description && <Desc>{description}</Desc>}
      </Card>
    </Container>
  );
};

export default Toast;