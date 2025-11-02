import React from 'react';
import styled, { css } from 'styled-components';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  showLabel?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

const Track = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  overflow: hidden;
`;

const Bar = styled.div<{ value: number; variant: NonNullable<ProgressBarProps['variant']> }>`
  height: 100%;
  width: ${({ value }) => Math.max(0, Math.min(100, value))}%;
  transition: width ${({ theme }) => theme.animations.duration.normal} ease;
  ${({ theme, variant }) =>
    variant === 'primary' && css`background: ${theme.colors.primary.main};` ||
    variant === 'success' && css`background: ${theme.colors.success.main};` ||
    variant === 'warning' && css`background: ${theme.colors.warning.main};` ||
    css`background: ${theme.colors.error.main};`}
`;

const Label = styled.span`
  margin-left: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.ui.caption.fontSize};
`;

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, showLabel = false, variant = 'primary', ...props }) => {
  return (
    <div {...props} style={{ display: 'flex', alignItems: 'center' }}>
      <Track>
        <Bar value={value} variant={variant} />
      </Track>
      {showLabel && <Label>{Math.round(value)}%</Label>}
    </div>
  );
};

export default ProgressBar;