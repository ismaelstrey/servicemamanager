import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

export type DatePickerSize = 'sm' | 'md' | 'lg';
export type DatePickerVariant = 'default' | 'filled' | 'outlined';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: DatePickerSize;
  variant?: DatePickerVariant;
  fullWidth?: boolean;
  showTime?: boolean;
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
`;

const Required = styled.span`
  color: ${({ theme }) => theme.colors.error.main};
  margin-left: ${({ theme }) => theme.spacing.xs};
`;

const Container = styled.div`
  position: relative;
  display: inline-flex;
  width: 100%;
`;

const StyledInput = styled.input<{ $size: DatePickerSize; $variant: DatePickerVariant; $hasError?: boolean }>`
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
          background-color: transparent;
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

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(({ 
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  showTime = false,
  className = '',
  id,
  ...props
}, ref) => {
  const datePickerId = id || `datepicker-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Wrapper $fullWidth={fullWidth} className={className}>
      {label && (
        <Label htmlFor={datePickerId}>
          {label}
          {props.required && <Required>*</Required>}
        </Label>
      )}
      <Container>
        <StyledInput
          ref={ref}
          id={datePickerId}
          type={showTime ? 'datetime-local' : 'date'}
          $size={size}
          $variant={variant}
          $hasError={Boolean(error)}
          {...props}
        />
        <Icon>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z"
              stroke="currentColor"
              strokeWidth="1.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M10.6667 1.33333V4" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.33333 1.33333V4" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 6.66667H14" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
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

DatePicker.displayName = 'DatePicker';

export default DatePicker;