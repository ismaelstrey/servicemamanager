import React from 'react';
import styled from 'styled-components';

export interface FormSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
`;

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.heading.h6.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h6.fontWeight};
`;

const Desc = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.ui.body.fontSize};
`;

export const FormSection: React.FC<FormSectionProps> = ({ title, description, children, ...props }) => {
  return (
    <Section {...props}>
      {title && <Title>{title}</Title>}
      {description && <Desc>{description}</Desc>}
      {children}
    </Section>
  );
};

export default FormSection;