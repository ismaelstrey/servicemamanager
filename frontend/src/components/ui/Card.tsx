import React from 'react';
import { StyledCard, CardHeader as StyledCardHeader, CardBody as StyledCardBody, CardFooter as StyledCardFooter } from './Card/Card.styles';
import type { CardProps as CardPropsTypes, CardHeaderProps, CardBodyProps, CardFooterProps } from './Card/Card.types';

const sizeToPadding = (size?: 'sm' | 'md' | 'lg'): 'none' | 'small' | 'medium' | 'large' => {
  switch (size) {
    case 'sm':
      return 'small';
    case 'lg':
      return 'large';
    case 'md':
    default:
      return 'medium';
  }
};

export const Card: React.FC<CardPropsTypes> = ({
  children,
  variant = 'default',
  padding = 'medium',
  size, // compatibilidade com API antiga
  className,
  hoverable,
  onClick,
  title,
  clickable,
  margin = 0,
}) => {
  const computedPadding = padding ?? sizeToPadding(size);
  const isClickable = Boolean(clickable) || Boolean(onClick);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!isClickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <StyledCard
      variant={variant}
      padding={computedPadding}
      hoverable={hoverable}
      onClick={onClick}
      className={className}
      title={title}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={handleKeyDown}
      margin={margin}
    >
      {children}
    </StyledCard>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <StyledCardHeader className={className}>{children}</StyledCardHeader>
);

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => (
  <StyledCardBody className={className}>{children}</StyledCardBody>
);

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <StyledCardFooter className={className}>{children}</StyledCardFooter>
);

export default Card;