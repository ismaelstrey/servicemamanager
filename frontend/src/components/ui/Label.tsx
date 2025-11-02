import React from 'react';
import styled from 'styled-components';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const StyledLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const Required = styled.span`
  color: ${({ theme }) => theme.colors.danger.main};
`;

export const Label: React.FC<LabelProps> = ({ children, required, ...props }) => {
  return (
    <StyledLabel {...props}>
      {children}
      {required && <Required aria-hidden>*</Required>}
    </StyledLabel>
  );
};

export default Label;