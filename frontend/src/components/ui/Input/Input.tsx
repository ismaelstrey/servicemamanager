import { forwardRef } from 'react';
import type { InputProps } from './Input.types';
import {
  InputContainer,
  InputLabel,
  InputWrapper,
  StyledInput,
  InputIcon,
  InputAddon,
  HelperText,
  ErrorText,
} from './Input.styles';

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  size = 'medium',
  variant = 'default',
  fullWidth = false,
  leftIcon,
  rightIcon,
  leftAddon,
  rightAddon,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  return (
    <InputContainer $fullWidth={fullWidth}>
      {label && (
        <InputLabel htmlFor={inputId}>
          {label}
        </InputLabel>
      )}
      
      <InputWrapper
        $hasLeftIcon={Boolean(leftIcon)}
        $hasRightIcon={Boolean(rightIcon)}
        $hasLeftAddon={Boolean(leftAddon)}
        $hasRightAddon={Boolean(rightAddon)}
        $hasError={hasError}
        $variant={variant}
      >
        {leftAddon && (
          <InputAddon $position="left">
            {leftAddon}
          </InputAddon>
        )}
        
        {leftIcon && (
          <InputIcon $position="left">
            {leftIcon}
          </InputIcon>
        )}
        
        <StyledInput
          ref={ref}
          id={inputId}
          $hasError={hasError}
          $hasLeftIcon={Boolean(leftIcon)}
          $hasRightIcon={Boolean(rightIcon)}
          $hasLeftAddon={Boolean(leftAddon)}
          $hasRightAddon={Boolean(rightAddon)}
          $inputSize={size}
          {...props}
        />
        
        {rightIcon && (
          <InputIcon $position="right">
            {rightIcon}
          </InputIcon>
        )}
        
        {rightAddon && (
          <InputAddon $position="right">
            {rightAddon}
          </InputAddon>
        )}
      </InputWrapper>
      
      {error && (
        <ErrorText>
          {error}
        </ErrorText>
      )}
      
      {helperText && !error && (
        <HelperText>
          {helperText}
        </HelperText>
      )}
    </InputContainer>
  );
});

Input.displayName = 'Input';

export default Input;