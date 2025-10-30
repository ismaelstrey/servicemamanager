import React from 'react';

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

export const Table: React.FC<TableProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  responsive = false,
  hoverable = false,
}) => {
  const baseClasses = 'table';
  const variantClasses = `table--${variant}`;
  const sizeClasses = `table--${size}`;
  const hoverableClasses = hoverable ? 'table--hoverable' : '';

  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    hoverableClasses,
    className,
  ].filter(Boolean).join(' ');

  const tableElement = (
    <table className={classes}>
      {children}
    </table>
  );

  if (responsive) {
    return (
      <div className="table-responsive">
        {tableElement}
      </div>
    );
  }

  return tableElement;
};

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className = '',
}) => {
  return (
    <thead className={`table__header ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className = '',
}) => {
  return (
    <tbody className={`table__body ${className}`}>
      {children}
    </tbody>
  );
};

export const TableFooter: React.FC<TableFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <tfoot className={`table__footer ${className}`}>
      {children}
    </tfoot>
  );
};

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className = '',
  onClick,
  selected = false,
}) => {
  const baseClasses = 'table__row';
  const clickableClasses = onClick ? 'table__row--clickable' : '';
  const selectedClasses = selected ? 'table__row--selected' : '';

  const classes = [
    baseClasses,
    clickableClasses,
    selectedClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <tr className={classes} onClick={onClick}>
      {children}
    </tr>
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
}) => {
  const baseClasses = 'table__cell table__cell--header';
  const alignClasses = `table__cell--${align}`;
  const sortableClasses = sortable ? 'table__cell--sortable' : '';
  const sortDirectionClasses = sortDirection ? `table__cell--sort-${sortDirection}` : '';

  const classes = [
    baseClasses,
    alignClasses,
    sortableClasses,
    sortDirectionClasses,
    className,
  ].filter(Boolean).join(' ');

  const style = width ? { width } : undefined;

  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  return (
    <th
      className={classes}
      style={style}
      scope={scope}
      onClick={handleClick}
    >
      <div className="table__cell-content">
        {children}
        {sortable && (
          <span className="table__sort-icon">
            {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}
          </span>
        )}
      </div>
    </th>
  );
};

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  align = 'left',
  width,
  colSpan,
}) => {
  const baseClasses = 'table__cell';
  const alignClasses = `table__cell--${align}`;

  const classes = [
    baseClasses,
    alignClasses,
    className,
  ].filter(Boolean).join(' ');

  const style = width ? { width } : undefined;

  return (
    <td className={classes} style={style} colSpan={colSpan}
    >
      {children}
    </td>
  );
};



export default Table;