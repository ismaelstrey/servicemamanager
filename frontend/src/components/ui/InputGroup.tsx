import React from 'react';
import styled, { css } from 'styled-components';
import Input from './Input';

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const Group = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  ${({ fullWidth }) => fullWidth && css`width: 100%;`}
`;

const Label = styled.label<{ required?: boolean }>`
  font-size: ${({ theme }) => theme.typography.ui.label.fontSize};
  font-weight: ${({ theme }) => theme.typography.ui.label.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  &::after {
    content: '${({ required }) => (required ? '*' : '')}';
    color: ${({ theme }) => theme.colors.error.main};
    margin-left: ${({ theme }) => theme.spacing.xs};
  }
`;

const Helper = styled.small`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.ui.caption.fontSize};
`;

const Error = styled.small`
  color: ${({ theme }) => theme.colors.error.main};
  font-size: ${({ theme }) => theme.typography.ui.caption.fontSize};
`;

export const InputGroup: React.FC<InputGroupProps> = ({ id, label, helperText, errorText, required, fullWidth, children, ...props }) => {
  return (
    <Group fullWidth={fullWidth} {...props}>
      {label && <Label htmlFor={id} required={required}>{label}</Label>}
      {children ?? <Input id={id} />}
      {helperText && !errorText && <Helper>{helperText}</Helper>}
      {errorText && <Error role="alert">{errorText}</Error>}
    </Group>
  );
};

export default InputGroup;