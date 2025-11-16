import React from 'react';
import styled, { css } from 'styled-components';

export type PaginationSize = 'sm' | 'md' | 'lg';

export interface PaginationProps {
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
  size?: PaginationSize;
}

const Container = styled.nav<{ $size: PaginationSize; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
`;

const List = styled.ul`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.xs};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Item = styled.li<{ $active?: boolean; $disabled?: boolean }>`
  display: inline-flex;
`;

const sizes = {
  sm: { padY: '4px', padX: '8px', font: '0.85rem' },
  md: { padY: '6px', padX: '12px', font: '0.95rem' },
  lg: { padY: '8px', padX: '14px', font: '1rem' },
};

const ButtonEl = styled.button<{ $active?: boolean; $disabled?: boolean; $size: PaginationSize }>`
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: ${({ $size }) => `${sizes[$size].padY} ${sizes[$size].padX}`};
  font-size: ${({ $size }) => sizes[$size].font};
  min-width: 36px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: all ${({ theme }) => theme.animations.duration.fast} ${({ theme }) => theme.animations.easing.easeInOut};

  ${({ $active, theme }) => $active && css`
    background: ${theme.colors.primary.main};
    color: ${theme.colors.primary.contrast};
    border-color: ${theme.colors.primary.main};
  `}

  &:hover {
    ${({ $disabled, $active, theme }) => !$disabled && !$active && css`
      background: ${theme.colors.background.primary};
      box-shadow: ${theme.shadows.sm};
    `}
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light};
  }
`;

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
    <Container aria-label="Navegação de páginas" className={className} $size={size} $disabled={disabled}>
      <List>
        {/* First page button */}
        {showFirstLast && (
          <PaginationItem
            disabled={disabled || currentPage === 1}
            onClick={() => handlePageChange(1)}
            size={size}
          >
            ««
          </PaginationItem>
        )}

        {/* Previous page button */}
        {showPrevNext && (
          <PaginationItem
            disabled={disabled || currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            size={size}
          >
            ‹
          </PaginationItem>
        )}

        {/* Page numbers */}
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
            <PaginationItem key={`ellipsis-${index}`} disabled size={size}>
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
              size={size}
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
            size={size}
          >
            ›
          </PaginationItem>
        )}

        {/* Last page button */}
        {showFirstLast && (
          <PaginationItem
            disabled={disabled || currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
            size={size}
          >
            »»
          </PaginationItem>
        )}
      </List>
    </Container>
  );
};

export const PaginationItem: React.FC<PaginationItemProps> = ({
  children,
  active = false,
  disabled = false,
  onClick,
  className = '',
  size = 'md',
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <Item className={className} $active={active} $disabled={disabled}>
      <ButtonEl
        onClick={handleClick}
        disabled={disabled}
        aria-current={active ? 'page' : undefined}
        type="button"
        $active={active}
        $disabled={disabled}
        $size={size}
      >
        {children}
      </ButtonEl>
    </Item>
  );
};



export default Pagination;
