import React from 'react';
import styled from 'styled-components';

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const Sep = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, separator = '/', ...props }) => {
  return (
    <Nav aria-label="breadcrumb" {...props}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {item.href && !isLast ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
            {!isLast && <Sep>{separator}</Sep>}
          </React.Fragment>
        );
      })}
    </Nav>
  );
};

export default Breadcrumb;