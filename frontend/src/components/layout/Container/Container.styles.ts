import styled, { css } from 'styled-components';
import { container as containerMixin } from '../../../styles/mixins/layout';

export interface StyledContainerProps {
  fluid?: boolean;
  maxWidthKey?: keyof any; // use theme.spacing.container.maxWidth keys (xs..2xl)
}

export const StyledContainer = styled.div<StyledContainerProps>`
  ${containerMixin()};

  ${({ theme, maxWidthKey }) =>
    maxWidthKey &&
    css`
      max-width: ${(theme as any)?.spacing?.container?.maxWidth?.[maxWidthKey as any] ?? (theme as any)?.spacing?.container?.maxWidth?.xl ?? '1280px'};
    `}

  ${({ fluid }) =>
    fluid &&
    css`
      max-width: none;
      width: 100%;
      padding-left: 0;
      padding-right: 0;
    `}

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding-left: ${({ theme }) => theme.spacing.container.padding.mobile};
    padding-right: ${({ theme }) => theme.spacing.container.padding.mobile};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) and (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding-left: ${({ theme }) => theme.spacing.container.padding.tablet};
    padding-right: ${({ theme }) => theme.spacing.container.padding.tablet};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding-left: ${({ theme }) => theme.spacing.container.padding.desktop};
    padding-right: ${({ theme }) => theme.spacing.container.padding.desktop};
  }
`;