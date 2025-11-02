import React from 'react';
import { PageWrapper, Header, Heading, Actions, Toolbar, Content, Footer } from './ListTemplate.styles';

interface ListTemplateProps {
  heading?: React.ReactNode;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ListTemplate: React.FC<ListTemplateProps> = ({
  heading,
  actions,
  toolbar,
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

      {toolbar && <Toolbar>{toolbar}</Toolbar>}

      <Content>{children}</Content>

      {footer && <Footer>{footer}</Footer>}
    </PageWrapper>
  );
};

export default ListTemplate;