import React from 'react';
import { HeaderContainer, TitleGroup, Title, Subtitle, Actions } from './PageHeader.styles';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <HeaderContainer>
      <TitleGroup>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </TitleGroup>
      {actions && <Actions>{actions}</Actions>}
    </HeaderContainer>
  );
};

export default PageHeader;