
import styled from 'styled-components';
import { useHelpDocs } from '../../hooks/useHelpDocs';
import { Heading } from '../../components/ui';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const List = styled.ul`
  list-style: disc;
  padding-left: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Item = styled.li`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Link = styled.a`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.primary.main};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const Path = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export function HelpPage(): React.ReactElement {
  const topics = useHelpDocs();

  return (
    <PageWrapper>
      <Heading level={2}>Help & Documentação</Heading>
      <Description>Acesse os tópicos de documentação do sistema.</Description>
      <List>
        {topics.map((t) => (
          <Item key={t.id}>
            <Link href={`/${t.path}`} target="_blank" rel="noopener noreferrer">{t.title}</Link>
            <Path>{t.path}</Path>
          </Item>
        ))}
      </List>
    </PageWrapper>
  );
}

export default HelpPage;
