import React from 'react';
import { Container, Content, Icon, Heading, Description, Actions } from './ErrorTemplate.styles';

interface ErrorTemplateProps {
  icon?: React.ReactNode;
  heading?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const ErrorTemplate: React.FC<ErrorTemplateProps> = ({
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

export default ErrorTemplate;