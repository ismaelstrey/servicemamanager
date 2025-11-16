import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useClientAuth } from '../../hooks/useClientAuth';
import ClientAuthService from '../../services/clientAuthService';
import type { ClientUser } from '../../types/client';
import { Card, CardHeader, CardBody, Input, Radio } from '../../components/ui';
import ClientUnifiedTimeline from '../../components/client/ClientUnifiedTimeline';
import type { ClientResourceType } from '../../services/clientTimelineService';

const ClientDashboardPage: React.FC = () => {
  const { user } = useClientAuth();
  const [profile, setProfile] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourceType, setResourceType] = useState<ClientResourceType>('TICKET');
  const [resourceId, setResourceId] = useState<string>('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ClientAuthService.getProfile();
        setProfile(data);
      } catch (e: any) {
        setError(e?.message || 'Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  return (
    <PageWrap>
      <h1>Olá, {user?.name || 'Cliente'}</h1>
      <Subtitle>Bem-vindo ao seu painel.</Subtitle>
      {loading && <p>Carregando seu perfil...</p>}
      {error && <ErrorText>{error}</ErrorText>}
      {profile && (
        <Section>
          <h2>Seu Perfil</h2>
          <ul>
            <li>ID: {profile.id}</li>
            <li>Nome: {profile.name}</li>
            <li>Email: {profile.email}</li>
            <li>Provider ID: {profile.providerId}</li>
          </ul>
        </Section>
      )}
      <SectionLg>
        <Card variant="outlined">
          <CardHeader>
            <HeaderRow>
              <strong>Timeline Unificada</strong>
              <HeaderHint>Selecione tipo e ID do recurso</HeaderHint>
            </HeaderRow>
          </CardHeader>
          <CardBody>
            <ControlsRow>
              <TypeRow>
                <Radio name="resourceType" defaultChecked onChange={() => setResourceType('TICKET')}>Ticket</Radio>
                <Radio name="resourceType" onChange={() => setResourceType('SERVICE_ORDER')}>Ordem de Serviço</Radio>
              </TypeRow>
              <Input placeholder="ID do recurso" onChange={(e: any) => setResourceId(e.target.value)} />
            </ControlsRow>
            {resourceId ? (
              <ClientUnifiedTimeline resourceType={resourceType} resourceId={resourceId} pageSize={10} />
            ) : (
              <Hint>Informe um ID de Ticket ou OS para visualizar.</Hint>
            )}
          </CardBody>
        </Card>
      </SectionLg>
    </PageWrap>
  );
};

const PageWrap = styled.div`
  max-width: 900px;
  margin: ${({ theme }) => theme.spacing.lg} auto;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error.main};
`;

const Section = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const SectionLg = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderHint = styled.small`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ControlsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TypeRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const Hint = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export default ClientDashboardPage;