import styled, { css } from 'styled-components';

export interface FlexProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: keyof any; // spacing token key
  directionMd?: FlexProps['direction'];
  directionLg?: FlexProps['direction'];
  alignMd?: FlexProps['align'];
  alignLg?: FlexProps['align'];
  justifyMd?: FlexProps['justify'];
  justifyLg?: FlexProps['justify'];
}

export const Flex = styled.div<FlexProps>`
  display: flex;
  flex-direction: ${({ direction = 'row' }) => direction};
  align-items: ${({ align = 'stretch' }) => align};
  justify-content: ${({ justify = 'flex-start' }) => justify};
  flex-wrap: ${({ wrap = 'nowrap' }) => wrap};
  gap: ${({ theme, gap }) => (gap ? (theme as any)?.spacing?.[gap as any] ?? (theme as any)?.spacing?.md : '0')};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    ${({ directionMd }) => directionMd && css`flex-direction: ${directionMd};`}
    ${({ alignMd }) => alignMd && css`align-items: ${alignMd};`}
    ${({ justifyMd }) => justifyMd && css`justify-content: ${justifyMd};`}
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    ${({ directionLg }) => directionLg && css`flex-direction: ${directionLg};`}
    ${({ alignLg }) => alignLg && css`align-items: ${alignLg};`}
    ${({ justifyLg }) => justifyLg && css`justify-content: ${justifyLg};`}
  }
`;