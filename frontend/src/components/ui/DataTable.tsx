import React from 'react';
import styled from 'styled-components';

export interface Column<T> {
  key: keyof T | string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  width?: string | number;
}

export interface DataTableProps<T> extends React.HTMLAttributes<HTMLTableElement> {
  columns: Column<T>[];
  data: T[];
}

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export function DataTable<T>({ columns, data, ...props }: DataTableProps<T>) {
  return (
    <Table {...props}>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <Th key={i} style={{ width: c.width as any }}>{c.header}</Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, ri) => (
          <tr key={ri}>
            {columns.map((c, ci) => (
              <Td key={ci}>{c.render ? c.render(row) : (row as any)[c.key]}</Td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default DataTable;