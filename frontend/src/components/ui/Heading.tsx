import React from 'react';
import styled, { css } from 'styled-components';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  align?: 'left' | 'center' | 'right';
}

const base = css`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const H1 = styled.h1`
  ${base};
  font-size: ${({ theme }) => theme.typography.heading.h1.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h1.fontWeight};
  line-height: ${({ theme }) => theme.typography.heading.h1.lineHeight};
  letter-spacing: ${({ theme }) => theme.typography.heading.h1.letterSpacing};
`;
const H2 = styled.h2`
  ${base};
  font-size: ${({ theme }) => theme.typography.heading.h2.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h2.fontWeight};
  line-height: ${({ theme }) => theme.typography.heading.h2.lineHeight};
  letter-spacing: ${({ theme }) => theme.typography.heading.h2.letterSpacing};
`;
const H3 = styled.h3`
  ${base};
  font-size: ${({ theme }) => theme.typography.heading.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h3.fontWeight};
  line-height: ${({ theme }) => theme.typography.heading.h3.lineHeight};
  letter-spacing: ${({ theme }) => theme.typography.heading.h3.letterSpacing};
`;
const H4 = styled.h4`
  ${base};
  font-size: ${({ theme }) => theme.typography.heading.h4.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h4.fontWeight};
  line-height: ${({ theme }) => theme.typography.heading.h4.lineHeight};
  letter-spacing: ${({ theme }) => theme.typography.heading.h4.letterSpacing};
`;
const H5 = styled.h5`
  ${base};
  font-size: ${({ theme }) => theme.typography.heading.h5.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h5.fontWeight};
  line-height: ${({ theme }) => theme.typography.heading.h5.lineHeight};
  letter-spacing: ${({ theme }) => theme.typography.heading.h5.letterSpacing};
`;
const H6 = styled.h6`
  ${base};
  font-size: ${({ theme }) => theme.typography.heading.h6.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h6.fontWeight};
  line-height: ${({ theme }) => theme.typography.heading.h6.lineHeight};
  letter-spacing: ${({ theme }) => theme.typography.heading.h6.letterSpacing};
`;

export const Heading: React.FC<HeadingProps> = ({ level = 2, align = 'left', children, ...props }) => {
  const shared = { style: { textAlign: align as React.CSSProperties['textAlign'] } };
  switch (level) {
    case 1:
      return (
        <H1 {...shared} {...props}>
          {children}
        </H1>
      );
    case 2:
      return (
        <H2 {...shared} {...props}>
          {children}
        </H2>
      );
    case 3:
      return (
        <H3 {...shared} {...props}>
          {children}
        </H3>
      );
    case 4:
      return (
        <H4 {...shared} {...props}>
          {children}
        </H4>
      );
    case 5:
      return (
        <H5 {...shared} {...props}>
          {children}
        </H5>
      );
    case 6:
      return (
        <H6 {...shared} {...props}>
          {children}
        </H6>
      );
    default:
      return (
        <H2 {...shared} {...props}>
          {children}
        </H2>
      );
  }
};

export default Heading;