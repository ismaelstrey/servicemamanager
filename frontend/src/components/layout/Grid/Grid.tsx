import React from 'react';
import { Grid as StyledGrid, GridItem as StyledGridItem, type GridProps as StyledGridProps } from './Grid.styles';

export interface GridProps extends StyledGridProps, React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({ children, ...props }) => {
  return <StyledGrid {...props}>{children}</StyledGrid>;
};

export const GridItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
  return <StyledGridItem {...props}>{children}</StyledGridItem>;
};

export default Grid;