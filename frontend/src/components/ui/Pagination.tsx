import React from 'react';

export type PaginationSize = 'sm' | 'md' | 'lg';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: PaginationSize;
  className?: string;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  disabled?: boolean;
}

interface PaginationItemProps {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  size = 'md',
  className = '',
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  disabled = false,
}) => {
  const baseClasses = 'pagination';
  const sizeClasses = `pagination--${size}`;
  const disabledClasses = disabled ? 'pagination--disabled' : '';

  const classes = [
    baseClasses,
    sizeClasses,
    disabledClasses,
    className,
  ].filter(Boolean).join(' ');

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }
    
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }
    
    // Add ellipsis and first page if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page: number) => {
    if (!disabled && page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav className={classes} aria-label="Navegação de páginas">
      <ul className="pagination__list">
        {/* First page button */}
        {showFirstLast && (
          <PaginationItem
            disabled={disabled || currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            ««
          </PaginationItem>
        )}

        {/* Previous page button */}
        {showPrevNext && (
          <PaginationItem
            disabled={disabled || currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ‹
          </PaginationItem>
        )}

        {/* Page numbers */}
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <PaginationItem key={`ellipsis-${index}`} disabled>
                ...
              </PaginationItem>
            );
          }

          const pageNumber = page as number;
          return (
            <PaginationItem
              key={pageNumber}
              active={pageNumber === currentPage}
              disabled={disabled}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </PaginationItem>
          );
        })}

        {/* Next page button */}
        {showPrevNext && (
          <PaginationItem
            disabled={disabled || currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            ›
          </PaginationItem>
        )}

        {/* Last page button */}
        {showFirstLast && (
          <PaginationItem
            disabled={disabled || currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            »»
          </PaginationItem>
        )}
      </ul>
    </nav>
  );
};

export const PaginationItem: React.FC<PaginationItemProps> = ({
  children,
  active = false,
  disabled = false,
  onClick,
  className = '',
}) => {
  const baseClasses = 'pagination__item';
  const activeClasses = active ? 'pagination__item--active' : '';
  const disabledClasses = disabled ? 'pagination__item--disabled' : '';

  const classes = [
    baseClasses,
    activeClasses,
    disabledClasses,
    className,
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <li className={classes}>
      <button
        className="pagination__button"
        onClick={handleClick}
        disabled={disabled}
        aria-current={active ? 'page' : undefined}
        type="button"
      >
        {children}
      </button>
    </li>
  );
};

// Compound component pattern
Pagination.Item = PaginationItem;

export default Pagination;