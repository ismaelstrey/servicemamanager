import React from 'react';
import styled, { css } from 'styled-components';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  attached?: boolean; // if true, visually merge borders
  orientation?: 'horizontal' | 'vertical';
  gap?: keyof typeof import('../../styles/tokens/spacing').spacing; // for external control, optional
  children: React.ReactNode;
}

const Group = styled.div<{ orientation: 'horizontal' | 'vertical'; attached?: boolean }>`
  display: inline-flex;
  flex-direction: ${({ orientation }) => (orientation === 'vertical' ? 'column' : 'row')};
  gap: ${({ theme }) => theme.spacing.xs};

  ${({ attached, orientation, theme }) => attached && css`
    gap: 0;
    & > * {
      border-radius: 0;
      ${orientation === 'horizontal'
        ? css`
            &:first-child { border-top-left-radius: ${theme.borders.radius.md}; border-bottom-left-radius: ${theme.borders.radius.md}; }
            &:last-child { border-top-right-radius: ${theme.borders.radius.md}; border-bottom-right-radius: ${theme.borders.radius.md}; }
            margin-left: -1px; // collapse borders
          `
        : css`
            &:first-child { border-top-left-radius: ${theme.borders.radius.md}; border-top-right-radius: ${theme.borders.radius.md}; }
            &:last-child { border-bottom-left-radius: ${theme.borders.radius.md}; border-bottom-right-radius: ${theme.borders.radius.md}; }
            margin-top: -1px;
          `}
    }
  `}
`;

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ attached = false, orientation = 'horizontal', children, ...props }) => {
  return (
    <Group attached={attached} orientation={orientation} {...props}>
      {children}
    </Group>
  );
};

export default ButtonGroup;