import React from 'react';
import { PageWrapper, Header, Heading, Actions, FormContainer, FormMain, FormSidebar, Footer } from './FormTemplate.styles';

interface FormTemplateProps {
  heading?: React.ReactNode;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FormTemplate: React.FC<FormTemplateProps> = ({
  heading,
  actions,
  sidebar,
  footer,
  children,
  className,
}) => {
  return (
    <PageWrapper className={className}>
      {(heading || actions) && (
        <Header>
          <Heading>{heading}</Heading>
          {actions && <Actions>{actions}</Actions>}
        </Header>
      )}

      <FormContainer>
        <FormMain>{children}</FormMain>
        {sidebar && <FormSidebar>{sidebar}</FormSidebar>}
      </FormContainer>

      {footer && <Footer>{footer}</Footer>}
    </PageWrapper>
  );
};

export default FormTemplate;