import React from 'react';
import { Flex as StyledFlex, type FlexProps as StyledFlexProps } from './Flex.styles';

export interface FlexProps extends StyledFlexProps, React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const Flex: React.FC<FlexProps> = ({ children, ...props }) => {
  return <StyledFlex {...props}>{children}</StyledFlex>;
};

export default Flex;