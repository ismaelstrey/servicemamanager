import React from 'react';
import type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './Card.types';
import { StyledCard, CardHeader as StyledCardHeader, CardBody as StyledCardBody, CardFooter as StyledCardFooter } from './Card.styles';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  className,
  onClick,
  hoverable = false,
  margin = 0,
  ...props
}) => {
  return (
    <StyledCard
      variant={variant}
      padding={padding}
      className={className}
      onClick={onClick}
      hoverable={hoverable}
      margin={margin}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <StyledCardHeader className={className} {...props}>
      {children}
    </StyledCardHeader>
  );
};

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <StyledCardBody className={className} {...props}>
      {children}
    </StyledCardBody>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <StyledCardFooter className={className} {...props}>
      {children}
    </StyledCardFooter>
  );
};

export default Card;