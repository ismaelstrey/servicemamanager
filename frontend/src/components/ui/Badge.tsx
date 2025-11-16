import React from 'react';
import styled, { css } from 'styled-components';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: React.ReactNode;
  dot?: boolean;
  outline?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const StyledBadge = styled.span<{
  $variant: BadgeVariant;
  $size: BadgeSize;
  $outline?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  white-space: nowrap;
  line-height: 1;
  border: 1px solid transparent;

  ${({ $size, theme }) => {
    switch ($size) {
      case 'sm':
        return css`
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          font-size: ${theme.typography.fontSize.xs};
        `;
      case 'lg':
        return css`
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.base};
        `;
      default:
        return css`
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          font-size: ${theme.typography.fontSize.sm};
        `;
    }
  }}

  ${({ $variant, $outline, theme }) => {
    const fill = (bg: string, fg: string) => css`
      background-color: ${bg};
      color: ${fg};
    `;

    const outlineCss = (color: string, fg?: string) => css`
      background-color: transparent;
      color: ${fg ?? color};
      border-color: ${color};
    `;

    switch ($variant) {
      case 'primary':
        return $outline
          ? outlineCss(theme.colors.primary.main, theme.colors.primary.main)
          : fill(theme.colors.primary.main, theme.colors.text.inverse);
      case 'secondary':
        return $outline
          ? outlineCss(theme.colors.secondary.main, theme.colors.secondary.main)
          : fill(theme.colors.secondary.main, theme.colors.text.inverse);
      case 'success':
        return $outline
          ? outlineCss(theme.colors.success.main, theme.colors.success.main)
          : fill(theme.colors.success.main, theme.colors.text.inverse);
      case 'danger':
        return $outline
          ? outlineCss(theme.colors.error.main, theme.colors.error.main)
          : fill(theme.colors.error.main, theme.colors.text.inverse);
      case 'warning':
        return $outline
          ? outlineCss(theme.colors.warning.main, theme.colors.warning.main)
          : fill(theme.colors.warning.main, theme.colors.text.inverse);
      case 'info':
        return $outline
          ? outlineCss(theme.colors.info.main, theme.colors.info.main)
          : fill(theme.colors.info.main, theme.colors.text.inverse);
      default:
        return $outline
          ? outlineCss(theme.colors.text.primary, theme.colors.text.primary)
          : fill(theme.colors.neutral[100], theme.colors.text.primary);
    }
  }}
`;

const Dot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: currentColor;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  margin-left: ${({ theme }) => theme.spacing.xs};
  opacity: 0.7;
  transition: opacity ${({ theme }) => theme.animations.transition.fast};

  &:hover {
    opacity: 1;
  }
`;

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  outline = false,
  removable = false,
  onRemove,
}) => {
  return (
    <StyledBadge className={className} $variant={variant} $size={size} $outline={outline}>
      {dot && <Dot />}
      <span>{children}</span>
      {removable && onRemove && (
        <RemoveButton onClick={onRemove} aria-label="Remover" type="button">×</RemoveButton>
      )}
    </StyledBadge>
  );
};

export default Badge;