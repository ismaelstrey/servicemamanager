import React from 'react';
import { Flex as StyledFlex, type FlexProps as StyledFlexProps } from './Flex.styles';
import styled from 'styled-components';

export interface FlexProps extends StyledFlexProps, React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const Flex: React.FC<FlexProps> = ({ children, ...props }) => {
  return <StyledFlex {...props}>{children}</StyledFlex>;
};
// Styled components reutilizáveis para layout
export const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
`;

export const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors?.text?.primary || '#111'};
  margin: 0 0 ${({ theme }) => theme.spacing?.md || '1rem'} 0;
  font-size: ${({ theme }) => theme.typography?.fontSize?.xl || '1.5rem'};
  font-weight: 600;
`;

export const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6b7280'};
  margin: 0 0 ${({ theme }) => theme.spacing?.md || '1rem'} 0;
  font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
`;

// (wrappers de filtros foram movidos para ReportsFilters)

export const ActionsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  margin: 0 0 ${({ theme }) => theme.spacing?.lg || '1.5rem'} 0;
  flex-wrap: wrap;
`;

export const Block = styled.div`
  margin: 0 0 ${({ theme }) => theme.spacing?.md || '1rem'} 0;

`;
export const BlockMargin = styled.div`
  { margin: '20px 0'}

`;

export const KpisGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  margin: 0 0 ${({ theme }) => theme.spacing?.lg || '1.5rem'} 0;

  @media (min-width: ${({ theme }) => theme.breakpoints?.lg || '1024px'}) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (max-width: ${({ theme }) => theme.breakpoints?.lg || '1024px'}) and (min-width: ${({ theme }) => theme.breakpoints?.sm || '640px'}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const ChartsGrid2 = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  margin: 0 0 ${({ theme }) => theme.spacing?.lg || '1.5rem'} 0;

  @media (min-width: ${({ theme }) => theme.breakpoints?.lg || '1024px'}) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const ChartsGrid3 = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  margin: 0 0 ${({ theme }) => theme.spacing?.lg || '1.5rem'} 0;

  @media (min-width: ${({ theme }) => theme.breakpoints?.lg || '1024px'}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const TablesGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};

  @media (min-width: ${({ theme }) => theme.breakpoints?.lg || '1024px'}) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography?.fontSize?.lg || '1.125rem'};
  font-weight: 600;
  margin: 0;
`;

export default Flex;