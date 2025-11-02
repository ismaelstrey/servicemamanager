import React from 'react';
import styled from 'styled-components';

export interface DataGridProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columns?: number;
}

const Grid = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

export function DataGrid<T>({ items, renderItem, columns = 3, ...props }: DataGridProps<T>) {
  return (
    <Grid columns={columns} {...props}>
      {items.map((it, i) => (
        <div key={i}>{renderItem(it, i)}</div>
      ))}
    </Grid>
  );
}

export default DataGrid;