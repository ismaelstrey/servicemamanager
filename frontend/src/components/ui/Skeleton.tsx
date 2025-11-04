import React from 'react';
import styled, { keyframes } from 'styled-components';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  className?: string;
}

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Box = styled.div<{ $w?: number | string; $h?: number | string; $r?: number }>`
  display: inline-block;
  width: ${({ $w }) => (typeof $w === 'number' ? `${$w}px` : $w || '100%')};
  height: ${({ $h }) => (typeof $h === 'number' ? `${$h}px` : $h || '1rem')};
  border-radius: ${({ $r }) => ($r ? `${$r}px` : '8px')};
  background: linear-gradient(90deg, rgba(200,200,200,0.2) 0%, rgba(200,200,200,0.4) 50%, rgba(200,200,200,0.2) 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, radius, className }) => {
  return <Box $w={width} $h={height} $r={radius} className={className} aria-hidden="true" />;
};

export default Skeleton;