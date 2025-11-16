import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

export type TextAreaSize = 'sm' | 'md' | 'lg';
export type TextAreaVariant = 'default' | 'filled' | 'outlined';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: TextAreaSize;
  variant?: TextAreaVariant;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
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

const StyledTextArea = styled.textarea<{ $size: TextAreaSize; $variant: TextAreaVariant; $hasError?: boolean; $resize: 'none' | 'vertical' | 'horizontal' | 'both' }>`
  width: 100%;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  transition: all ${({ theme }) => theme.animations.transition.fast};
  resize: ${({ $resize }) => $resize};

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

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ 
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  resize = 'vertical',
  className = '',
  id,
  rows = 3,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Wrapper $fullWidth={fullWidth} className={className}>
      {label && (
        <Label htmlFor={textareaId}>
          {label}
          {props.required && <Required>*</Required>}
        </Label>
      )}
      <Container>
        <StyledTextArea
          ref={ref}
          id={textareaId}
          rows={rows}
          $size={size}
          $variant={variant}
          $hasError={Boolean(error)}
          $resize={resize}
          {...props}
        />
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

TextArea.displayName = 'TextArea';

export default TextArea;
