import React from 'react';
import styled from 'styled-components';
import { hideAbove, hideBelow } from '../../../styles/mixins/layout';

export interface VisibilityProps {
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children?: React.ReactNode;
}

const HideBelowWrapper = styled.div<{ bp: VisibilityProps['breakpoint'] }>`
  ${props => hideBelow(props.bp)}
`;

const HideAboveWrapper = styled.div<{ bp: VisibilityProps['breakpoint'] }>`
  ${props => hideAbove(props.bp)}
`;

export const HideBelow: React.FC<VisibilityProps> = ({ breakpoint, children }) => (
  <HideBelowWrapper bp={breakpoint}>{children}</HideBelowWrapper>
);

export const HideAbove: React.FC<VisibilityProps> = ({ breakpoint, children }) => (
  <HideAboveWrapper bp={breakpoint}>{children}</HideAboveWrapper>
);

export default { HideBelow, HideAbove };