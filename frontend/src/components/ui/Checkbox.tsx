import React, { useId } from 'react';
import styled, { css } from 'styled-components';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: CheckboxSize;
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

const Box = styled.span<{ size: CheckboxSize; checked?: boolean; hasError?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  background: ${({ theme }) => theme.colors.surface};
  transition: all ${({ theme }) => theme.animations.transition.fast};

  ${({ size }) => {
    switch (size) {
      case 'sm':
        return css`width: 16px; height: 16px;`;
      case 'lg':
        return css`width: 20px; height: 20px;`;
      default:
        return css`width: 18px; height: 18px;`;
    }
  }}

  ${({ checked, theme }) =>
    checked && css`
      border-color: ${theme.colors.primary.main};
      background: ${theme.colors.primary.main};
      color: ${theme.colors.text.inverse};
    `}
`;

const Check = styled.span`
  width: 10px;
  height: 10px;
  border-radius: ${({ theme }) => theme.borders.radius.xs};
  background: currentColor;
`;

const LabelText = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  size = 'md',
  checked,
  defaultChecked,
  disabled,
  onChange,
  className,
  ...props
}) => {
  const id = useId();
  const isChecked = checked ?? defaultChecked ?? false;

  return (
    <Wrapper htmlFor={id} className={className} disabled={disabled}>
      <HiddenInput
        id={id}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        {...props}
      />
      <Box size={size} checked={!!isChecked} aria-hidden>
        {isChecked && <Check />}
      </Box>
      {label && <LabelText>{label}</LabelText>}
    </Wrapper>
  );
};

export default Checkbox;