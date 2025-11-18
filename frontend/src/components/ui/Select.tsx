import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'default' | 'filled' | 'outlined';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: SelectSize;
  variant?: SelectVariant;
  fullWidth?: boolean;
  placeholder?: string;
  children: React.ReactNode;
}

const Wrapper = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Container = styled.div`
  position: relative;
  display: inline-flex;
  width: 100%;
`;

const StyledSelect = styled.select<{ $size: SelectSize; $variant: SelectVariant; $hasError?: boolean }>`
  appearance: none;
  width: 100%;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  transition: all ${({ theme }) => theme.animations.transition.fast};

  ${({ $size, theme }) => {
    switch ($size) {
      case 'sm':
        return css`padding: ${theme.spacing.xs} ${theme.spacing.sm}; font-size: ${theme.typography.fontSize.sm};`;
      case 'lg':
        return css`padding: ${theme.spacing.md} ${theme.spacing.lg}; font-size: ${theme.typography.fontSize.lg};`;
      default:
        return css`padding: ${theme.spacing.sm} ${theme.spacing.md}; font-size: ${theme.typography.fontSize.base};`;
    }
  }}

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'filled':
        return css`
          background-color: ${theme.colors.neutral[100]};
          border-color: transparent;
        `;
      case 'outlined':
        return css`
          background-color: ${theme.mode === 'dark' ? theme.colors.background.secondary : 'transparent'};
          border-color: ${theme.colors.border.primary};
        `;
      default:
        return css``;
    }
  }}

  ${({ $hasError, theme }) => $hasError && css`
    border-color: ${theme.colors.error.main};
    box-shadow: ${theme.shadows.focus.danger};
  `}

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: ${({ theme }) => theme.shadows.focus.primary};
    outline: none;
  }

  & option {
    background-color: ${({ theme }) => theme.mode === 'dark' ? theme.colors.background.secondary : theme.colors.surface};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Icon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.secondary};
  pointer-events: none;
`;

const Feedback = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const HelperText = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  placeholder,
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 11)}`;

  return (
    <Wrapper $fullWidth={fullWidth}>
      {label && (
        <Label htmlFor={selectId}>
          {label}
          {props.required && <span>*</span>}
        </Label>
      )}
      <Container>
        <StyledSelect
          ref={ref}
          id={selectId}
          $size={size}
          $variant={variant}
          $hasError={Boolean(error)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </StyledSelect>
        <Icon>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Icon>
      </Container>
      {(error || helperText) && (
        <Feedback>
          {error && <ErrorText>{error}</ErrorText>}
          {!error && helperText && <HelperText>{helperText}</HelperText>}
        </Feedback>
      )}
    </Wrapper>
  );
});

Select.displayName = 'Select';

export default Select;