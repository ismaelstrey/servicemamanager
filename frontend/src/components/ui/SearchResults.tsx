import React from 'react';
import styled from 'styled-components';

export interface SearchResultItem {
  title: React.ReactNode;
  description?: React.ReactNode;
}

export interface SearchResultsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SearchResultItem[];
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Item = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
`;

const Title = styled.div`
  font-weight: ${({ theme }) => theme.typography.ui.subtitle.fontWeight};
`;

const Desc = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.ui.body.fontSize};
`;

export const SearchResults: React.FC<SearchResultsProps> = ({ items, ...props }) => {
  return (
    <List {...props}>
      {items.map((it, i) => (
        <Item key={i}>
          <Title>{it.title}</Title>
          {it.description && <Desc>{it.description}</Desc>}
        </Item>
      ))}
    </List>
  );
};

export default SearchResults;