import React from 'react';
import styled from 'styled-components';

export type SpacerAxis = 'x' | 'y';

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof any; // spacing token key or raw value via style
  axis?: SpacerAxis;
}

const StyledSpacer = styled.div<Required<Pick<SpacerProps, 'axis' | 'size'>>>`
  flex: 0 0 auto;
  width: ${({ axis, theme, size }) => (axis === 'x' ? ((theme as any)?.spacing?.[size as any] ?? size) : '1px')};
  height: ${({ axis, theme, size }) => (axis === 'y' ? ((theme as any)?.spacing?.[size as any] ?? size) : '1px')};
`;

const Spacer: React.FC<SpacerProps> = ({ size = 'md', axis = 'y', ...props }) => {
  return <StyledSpacer axis={axis} size={size} {...props} />;
};

export default Spacer;