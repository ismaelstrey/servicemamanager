import React from 'react';
import { Container, Content, Icon, Heading, Description, Actions } from './EmptyStateTemplate.styles';

interface EmptyStateTemplateProps {
  icon?: React.ReactNode;
  heading?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const EmptyStateTemplate: React.FC<EmptyStateTemplateProps> = ({
  icon,
  heading,
  description,
  actions,
  className,
}) => {
  return (
    <Container className={className}>
      <Content>
        {icon && <Icon>{icon}</Icon>}
        {heading && <Heading>{heading}</Heading>}
        {description && <Description>{description}</Description>}
        {actions && <Actions>{actions}</Actions>}
      </Content>
    </Container>
  );
};

export default EmptyStateTemplate;