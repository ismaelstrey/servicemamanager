import React from 'react';
import { StyledContainer } from './Container.styles';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  fluid?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Container: React.FC<ContainerProps> = ({ children, fluid = false, maxWidth, ...props }) => {
  return (
    <StyledContainer fluid={fluid} maxWidthKey={maxWidth} {...props}>
      {children}
    </StyledContainer>
  );
};

export default Container;