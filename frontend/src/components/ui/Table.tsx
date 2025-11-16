import React from 'react';
import styled, { css } from 'styled-components';

export type TableVariant = 'default' | 'striped' | 'bordered';
export type TableSize = 'sm' | 'md' | 'lg';

export interface TableProps {
  children: React.ReactNode;
  variant?: TableVariant;
  size?: TableSize;
  className?: string;
  responsive?: boolean;
  hoverable?: boolean;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  sortable?: boolean;
  onSort?: () => void;
  sortDirection?: 'asc' | 'desc' | null;
  colSpan?: number;
}

interface TableHeaderCellProps extends TableCellProps {
  scope?: 'col' | 'row';
}

const Responsive = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const TableRoot = styled.table<{ $variant: TableVariant; $size: TableSize; $hoverable?: boolean }>`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  color: ${({ theme }) => theme.colors.text.primary};

  ${({ $variant, theme }) => $variant === 'bordered' && css`
    border: 1px solid ${theme.colors.border.primary};
  `}

  ${({ $size, theme }) => {
    switch ($size) {
      case 'sm':
        return css`
          font-size: ${theme.typography.fontSize.sm};
          --table-pad-y: ${theme.spacing.xs};
          --table-pad-x: ${theme.spacing.sm};
        `;
      case 'lg':
        return css`
          font-size: ${theme.typography.fontSize.lg};
          --table-pad-y: ${theme.spacing.md};
          --table-pad-x: ${theme.spacing.lg};
        `;
      default:
        return css`
          font-size: ${theme.typography.fontSize.base};
          --table-pad-y: ${theme.spacing.sm};
          --table-pad-x: ${theme.spacing.md};
        `;
    }
  }}

  ${({ $variant, theme }) => $variant === 'striped' && css`
    tbody tr:nth-child(even) {
      background-color: ${theme.colors.neutral[100]};
    }
  `}

  ${({ $hoverable, theme }) => $hoverable && css`
    tbody tr:hover {
      background-color: ${theme.colors.neutral[100]};
    }
  `}

  ${({ $variant, theme }) => $variant === 'bordered' && css`
    thead th, tbody td {
      border-right: 1px solid ${theme.colors.border.secondary};
    }
    thead th:last-child, tbody td:last-child {
      border-right: none;
    }
  `}
`;

const Thead = styled.thead`
  background: ${({ theme }) => theme.colors.neutral[100]};
`;

const Tbody = styled.tbody``;

const Tfoot = styled.tfoot`
  background: ${({ theme }) => theme.colors.background.tertiary};
`;

const Tr = styled.tr<{ $clickable?: boolean; $selected?: boolean }>`
  ${({ $clickable }) => $clickable && css`cursor: pointer;`}
  ${({ $selected, theme }) => $selected && css`
    background-color: ${theme.colors.primary[50]};
  `}
`;

const Th = styled.th<{ $align: 'left' | 'center' | 'right'; $sortable?: boolean; $sortDirection?: 'asc' | 'desc' | null }>`
  text-align: ${({ $align }) => $align};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  white-space: nowrap;

  padding: var(--table-pad-y) var(--table-pad-x);
`;

const Td = styled.td<{ $align: 'left' | 'center' | 'right' }>`
  text-align: ${({ $align }) => $align};
  color: ${({ theme }) => theme.colors.text.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};

  padding: var(--table-pad-y) var(--table-pad-x);
`;

const CellContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SortIcon = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Table: React.FC<TableProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  responsive = false,
  hoverable = false,
}) => {
  const table = (
    <TableRoot className={className} $variant={variant} $size={size} $hoverable={hoverable}>
      {children}
    </TableRoot>
  );

  if (responsive) {
    return <Responsive>{table}</Responsive>;
  }

  return table;
};

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className = '',
}) => {
  return <Thead className={className}>{children}</Thead>;
};

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className = '',
}) => {
  return <Tbody className={className}>{children}</Tbody>;
};

export const TableFooter: React.FC<TableFooterProps> = ({
  children,
  className = '',
}) => {
  return <Tfoot className={className}>{children}</Tfoot>;
};

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className = '',
  onClick,
  selected = false,
}) => {
  return (
    <Tr className={className} onClick={onClick} $clickable={!!onClick} $selected={selected}>
      {children}
    </Tr>
  );
};

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  className = '',
  align = 'left',
  width,
  sortable = false,
  onSort,
  sortDirection = null,
  scope = 'col',
  colSpan,
}) => {
  const handleClick = () => {
    if (sortable && onSort) onSort();
  };

  const style = width ? { width } : undefined;

  return (
    <Th className={className} $align={align} $sortable={sortable} $sortDirection={sortDirection} style={style} scope={scope} onClick={handleClick} colSpan={colSpan}>
      <CellContent>
        {children}
        {sortable && <SortIcon>{sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}</SortIcon>}
      </CellContent>
    </Th>
  );
};

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  align = 'left',
  width,
  colSpan,
}) => {
  const style = width ? { width } : undefined;
  return (
    <Td className={className} $align={align} style={style} colSpan={colSpan}>
      {children}
    </Td>
  );
};

export default Table;