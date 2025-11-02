import styled from 'styled-components';

export const Container = styled.div`
  min-height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border.secondary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
`;

export const Content = styled.div`
  max-width: 600px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const Icon = styled.div`
  font-size: 40px;
  opacity: 0.7;
`;

export const Heading = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize['xl']};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Actions = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;