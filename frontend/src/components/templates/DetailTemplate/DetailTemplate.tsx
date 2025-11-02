import React from 'react';
import { PageWrapper, Header, Heading, Actions, MainContent, MetaSidebar, Footer } from './DetailTemplate.styles';

interface DetailTemplateProps {
  heading?: React.ReactNode;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DetailTemplate: React.FC<DetailTemplateProps> = ({
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

      <MainContent>{children}</MainContent>
      {sidebar && <MetaSidebar>{sidebar}</MetaSidebar>}

      {footer && <Footer>{footer}</Footer>}
    </PageWrapper>
  );
};

export default DetailTemplate;