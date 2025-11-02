import React from 'react';
import styled, { css } from 'styled-components';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  size?: SwitchSize;
  label?: string;
}

const Wrapper = styled.label<{ disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const Track = styled.span<{ size: SwitchSize; checked?: boolean }>`
  position: relative;
  display: inline-block;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.muted};
  transition: background ${({ theme }) => theme.animations.transition.fast};

  ${({ size }) => {
    switch (size) {
      case 'sm':
        return css`width: 32px; height: 18px;`;
      case 'lg':
        return css`width: 48px; height: 26px;`;
      default:
        return css`width: 40px; height: 22px;`;
    }
  }}

  ${({ checked, theme }) =>
    checked && css`
      background: ${theme.colors.primary.main};
    `}
`;

const Thumb = styled.span<{ size: SwitchSize; checked?: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: left ${({ theme }) => theme.animations.transition.fast};

  ${({ size }) => {
    switch (size) {
      case 'sm':
        return css`width: 14px; height: 14px; left: 2px;`;
      case 'lg':
        return css`width: 22px; height: 22px; left: 2px;`;
      default:
        return css`width: 18px; height: 18px; left: 2px;`;
    }
  }}

  ${({ checked, size }) =>
    checked &&
    css`
      left: ${size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px'};
    `}
`;

const LabelText = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

export const Switch: React.FC<SwitchProps> = ({
  checked,
  defaultChecked,
  onChange,
  disabled,
  size = 'md',
  label,
  className,
  ...props
}) => {
  const isChecked = checked ?? defaultChecked ?? false;

  return (
    <Wrapper disabled={disabled} className={className}>
      <HiddenInput
        type="checkbox"
        role="switch"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        aria-checked={!!isChecked}
        {...props}
      />
      <Track size={size} checked={!!isChecked} aria-hidden>
        <Thumb size={size} checked={!!isChecked} />
      </Track>
      {label && <LabelText>{label}</LabelText>}
    </Wrapper>
  );
};

export default Switch;