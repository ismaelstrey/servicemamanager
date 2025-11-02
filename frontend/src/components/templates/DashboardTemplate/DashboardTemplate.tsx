import React from 'react';
import {
  PageWrapper,
  Header,
  Heading,
  Actions,
  ContentGrid,
  MainContent,
  Sidebar,
  Footer,
} from './DashboardTemplate.styles';

interface DashboardTemplateProps {
  heading?: React.ReactNode;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
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

      <ContentGrid>
        <MainContent>{children}</MainContent>
        {sidebar && <Sidebar>{sidebar}</Sidebar>}
      </ContentGrid>

      {footer && <Footer>{footer}</Footer>}
    </PageWrapper>
  );
};

export default DashboardTemplate;