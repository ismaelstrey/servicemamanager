import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, Spinner, Alert } from '../../components/ui';
import { ApiService } from '../../services/api';

interface ProviderDetails {
  id: number;
  name: string;
  workspace: string;
  email?: string;
  status?: string;
  plan?: string;
  cnpj?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  usersCount?: number;
  equipmentsCount?: number;
  ticketsCount?: number;
}

const ProviderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<ProviderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProvider = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiService.get<any>(`/providers/${id}`);
      const data = res?.data?.data ?? res?.data ?? null;
      setProvider(data);
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao carregar detalhes do provedor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProvider();
    }
  }, [id]);

  return (
    <Page initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Header>
        <Title>Detalhes do Provedor</Title>
        <Button onClick={() => navigate('/providers')}>Voltar</Button>
      </Header>

      <AnimatePresence>{error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Alert variant="error">{error}</Alert>
        </motion.div>
      )}</AnimatePresence>

      {loading ? (
        <Centered>
          <Spinner size="md" label="Carregando detalhes..." />
        </Centered>
      ) : provider ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <Grid>
              <div>
                <SectionTitle>{provider.name}</SectionTitle>
                <Tags>
                  {provider.plan && <Badge variant="info">{provider.plan}</Badge>}
                  {provider.status && (
                    <Badge variant={provider.status === 'active' ? 'success' : 'warning'}>{provider.status}</Badge>
                  )}
                </Tags>

                <InfoGrid>
                  <div><strong>Workspace:</strong> {provider.workspace}</div>
                  <div><strong>E-mail:</strong> {provider.email || '-'}</div>
                  <div><strong>CNPJ:</strong> {provider.cnpj || '-'}</div>
                  <div><strong>Criado em:</strong> {provider.createdAt ? new Date(provider.createdAt).toLocaleString() : '-'}</div>
                  <div><strong>Atualizado em:</strong> {provider.updatedAt ? new Date(provider.updatedAt).toLocaleString() : '-'}</div>
                </InfoGrid>
              </div>

              <div>
                <SubTitle>Estatísticas</SubTitle>
                <Stats>
                  <Card variant="outlined">
                    <StatPad>
                      <StatLabel>Usuários</StatLabel>
                      <StatValue>{provider.usersCount ?? '-'}</StatValue>
                    </StatPad>
                  </Card>
                  <Card variant="outlined">
                    <StatPad>
                      <StatLabel>Equipamentos</StatLabel>
                      <StatValue>{provider.equipmentsCount ?? '-'}</StatValue>
                    </StatPad>
                  </Card>
                  <Card variant="outlined">
                    <StatPad>
                      <StatLabel>Tickets</StatLabel>
                      <StatValue>{provider.ticketsCount ?? '-'}</StatValue>
                    </StatPad>
                  </Card>
                </Stats>

                <Actions>
                  <Button onClick={() => navigate(`/dashboard?provider=${provider.id}`)}>Ver Dashboard</Button>
                  <Button onClick={() => navigate(`/providers/${provider.id}/settings`)}>Configurações</Button>
                </Actions>
              </div>
            </Grid>
          </Card>
        </motion.div>
      ) : (
        <Alert variant="error">Provedor não encontrado.</Alert>
      )}
    </Page>
  );
};

export default ProviderDetailsPage;

// styled-components
const Page = styled(motion.div)`
  display: grid;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
`;

const SectionTitle = styled.h2`
  margin: 0 0 8px 0;
`;

const SubTitle = styled.h3`
  margin: 0;
`;

const Grid = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const Tags = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 8px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const StatPad = styled.div`
  padding: 12px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 600;
`;

const Actions = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 8px;
`;

const Centered = styled.div`
  padding: 24px;
  display: flex;
  justify-content: center;
`;