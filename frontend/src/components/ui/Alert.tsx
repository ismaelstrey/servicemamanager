import React from 'react';
import styled, { css } from 'styled-components';

export type AlertVariant = 'success' | 'danger' | 'warning' | 'info' | 'custom' | 'error' | 'primary';
export type AlertSize = 'sm' | 'md' | 'lg';

export interface AlertProps {
  children: React.ReactNode;
  variant: AlertVariant;
  size?: AlertSize;
  className?: string;
  title?: string;
  dismissible?: boolean;
  description?: React.ReactNode;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

const defaultIcons = {
  success: '✓',
  danger: '✕',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const Container = styled.div<{ $variant: AlertVariant; $size: AlertSize; $dismissible?: boolean }>`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};

  ${({ $size, theme }) => {
    switch ($size) {
      case 'sm':
        return css`padding: ${theme.spacing.xs};`;
      case 'lg':
        return css`padding: ${theme.spacing.lg};`;
      default:
        return css`padding: ${theme.spacing.md};`;
    }
  }}

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'success':
        return css`border-color: ${theme.colors.success.main};`;
      case 'danger':
      case 'error':
        return css`border-color: ${theme.colors.error.main};`;
      case 'warning':
        return css`border-color: ${theme.colors.warning.main};`;
      case 'info':
        return css`border-color: ${theme.colors.info.main};`;
      case 'primary':
        return css`border-color: ${theme.colors.primary.main};`;
      default:
        return css``;
    }
  }}
`;

const Content = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  flex: 1;
`;

const IconBox = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Title = styled.div`
  font-weight: ${({ theme }) => theme.typography.ui.subtitle.fontWeight};
`;

const Description = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Message = styled.div``;

const Dismiss = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.sm};
  top: ${({ theme }) => theme.spacing.sm};
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
`;

export const Alert: React.FC<AlertProps> = ({
  children,
  variant,
  size = 'md',
  className = '',
  description,
  title,
  dismissible = false,
  onDismiss,
  icon,
}) => {
  const alertIcon = icon || defaultIcons[variant as keyof typeof defaultIcons];

  return (
    <Container className={className} $variant={variant} $size={size} $dismissible={dismissible} role="alert" aria-live="polite">
      <Content>
        {alertIcon && (
          <IconBox>{alertIcon}</IconBox>
        )}
        <Body>
          {title && (
            <Title>
              {title}
              {description && (
                <Description>{description}</Description>
              )}
            </Title>
          )}
          <Message>{children}</Message>
        </Body>
      </Content>
      {dismissible && onDismiss && (
        <Dismiss onClick={onDismiss} aria-label="Fechar alerta" type="button">×</Dismiss>
      )}
    </Container>
  );
};

export default Alert;