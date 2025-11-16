import React, { useId } from 'react';
import styled, { css } from 'styled-components';

export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: RadioSize;
  children?: React.ReactNode;
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

const Circle = styled.span<{ size: RadioSize; checked?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 50%;
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
      color: ${theme.colors.primary.main};
    `}
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
`;

const LabelText = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

export const Radio: React.FC<RadioProps> = ({
  label,
  size = 'md',
  checked,
  defaultChecked,
  disabled,
  onChange,
  className,
  children,
  ...props
}) => {
  const id = useId();
  const isChecked = checked ?? defaultChecked ?? false;
  const finalLabel = label ?? (typeof children === 'string' ? children : undefined);

  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    id,
    type: 'radio',
    disabled,
    onChange,
    ...props,
  };

  if (checked !== undefined) {
    inputProps.checked = checked;
  } else if (defaultChecked !== undefined) {
    inputProps.defaultChecked = defaultChecked;
  }

  return (
    <Wrapper htmlFor={id} className={className} disabled={disabled}>
      <HiddenInput {...inputProps} aria-checked={!!isChecked} role="radio" />
      <Circle size={size} checked={!!isChecked} aria-hidden>
        {isChecked && <Dot />}
      </Circle>
      {finalLabel && <LabelText>{finalLabel}</LabelText>}
    </Wrapper>
  );
};

export default Radio;