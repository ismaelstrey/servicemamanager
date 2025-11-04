import React from 'react';
import styled from 'styled-components';
import Button from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Title = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const IconBox = styled.div`
  font-size: 2rem;
  opacity: 0.8;
`;

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = '🗂️', actionLabel, onAction, className }) => {
  return (
    <Wrapper className={className} role="status" aria-live="polite">
      <IconBox aria-hidden>{icon}</IconBox>
      <Title>{title}</Title>
      {description && <div>{description}</div>}
      {actionLabel && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Wrapper>
  );
};

export default EmptyState;