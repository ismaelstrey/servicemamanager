import styled, { css } from 'styled-components';

export interface GridProps {
  columns?: string; // e.g. '1fr 2fr' or 'repeat(3, 1fr)'
  gap?: keyof any; // spacing token key like 'sm' | 'md'
  minColWidth?: string; // e.g. '240px' for auto-fit grids
  mdColumns?: string;
  lgColumns?: string;
  xlColumns?: string;
}

export const Grid = styled.div<GridProps>`
  display: grid;
  gap: ${({ theme, gap }) => (gap ? (theme as any)?.spacing?.[gap as any] ?? (theme as any)?.spacing?.md : (theme as any)?.spacing?.md)};

  ${({ columns }) =>
    columns &&
    css`
      grid-template-columns: ${columns};
    `}

  ${({ minColWidth }) =>
    minColWidth &&
    css`
      grid-template-columns: repeat(auto-fit, minmax(${minColWidth}, 1fr));
    `}

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    ${({ mdColumns }) =>
      mdColumns &&
      css`
        grid-template-columns: ${mdColumns};
      `}
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    ${({ lgColumns }) =>
      lgColumns &&
      css`
        grid-template-columns: ${lgColumns};
      `}
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
    ${({ xlColumns }) =>
      xlColumns &&
      css`
        grid-template-columns: ${xlColumns};
      `}
  }
`;

export const GridItem = styled.div`
  min-width: 0; /* Allow content to shrink in grid items */
`;