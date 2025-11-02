import React from 'react';
import styled from 'styled-components';

export interface IconProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  title?: string;
}

const Wrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
`;

export const Icon: React.FC<IconProps> = ({ icon: IconComp, size = 18, color, strokeWidth = 2, className, title }) => {
  return (
    <Wrapper className={className} aria-label={title} role={title ? 'img' : undefined}>
      <IconComp size={size} color={color} strokeWidth={strokeWidth} />
    </Wrapper>
  );
};

export default Icon;