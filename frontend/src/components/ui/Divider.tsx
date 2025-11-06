import React from 'react';
import styled, { css } from 'styled-components';

export type DividerVariant = 'solid' | 'dashed' | 'subtle';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  variant?: DividerVariant;
}

// Use prop transitório ($variant) para não encaminhar ao DOM
const Hr = styled.hr<{ $variant?: DividerVariant }>`
  border: 0;
  margin: ${({ theme }) => theme.spacing.md} 0;
  height: 1px;
  background: ${({ theme }) => theme.colors.border.primary};

  ${({ $variant, theme }) =>
    $variant === 'dashed'
      ? css`
          background: none;
          border-top: 1px dashed ${theme.colors.border.primary};
        `
      : $variant === 'subtle'
      ? css`
          background: ${theme.colors.border.secondary};
        `
      : css``}
`;

export const Divider: React.FC<DividerProps> = ({ variant = 'solid', ...props }) => {
  return <Hr role="separator" aria-orientation="horizontal" $variant={variant} {...props} />;
};

export default Divider;