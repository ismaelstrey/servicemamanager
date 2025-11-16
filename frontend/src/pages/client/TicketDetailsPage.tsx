import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Card, CardHeader, CardBody, Badge, Spinner, Alert } from '../../components/ui';
import ClientTimelineWidget from '../../components/client/ClientTimelineWidget';
import { ApiService } from '../../services/api';

interface ClientTicketDetailsResponse {
  ticket: any;
  comments: any[];
  sla?: {
    enabled: boolean;
    priority: string;
    status: string;
    responseDueAt?: string;
    resolutionDueAt?: string;
    responseLateByMinutes?: number;
    resolutionLateByMinutes?: number;
    isBreached: boolean;
  };
}

const ClientTicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<ClientTicketDetailsResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await ApiService.get<ClientTicketDetailsResponse>(`/client/tickets/${id}`);
        if (!isMounted) return;
        const data = (res.data as any)?.data ?? res.data; // normaliza envelope
        setDetails(data);
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar ticket');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [id]);

  return (
    <PageWrap>
      <h1>Ticket #{id}</h1>
      <Subtitle>Detalhes do ticket no Portal do Cliente</Subtitle>

      {loading && (
        <LoadingRow>
          <Spinner />
        </LoadingRow>
      )}
      {error && (
        <ErrorRow>
          <Alert variant="error">{error}</Alert>
        </ErrorRow>
      )}

      {details?.ticket && (
        <MetaRow>
          <Badge variant="info">Status: {details.ticket.status}</Badge>
          {details.ticket.priority && <Badge variant="secondary">Prioridade: {details.ticket.priority}</Badge>}
          {details.sla?.enabled && (
            <>
              {details.sla.responseDueAt && (
                <Badge variant="info">Resposta até: {new Date(details.sla.responseDueAt).toLocaleString()}</Badge>
              )}
              {details.sla.resolutionDueAt && (
                <Badge variant="info">Resolução até: {new Date(details.sla.resolutionDueAt).toLocaleString()}</Badge>
              )}
              {details.sla.isBreached && (
                <Badge variant="danger">SLA em atraso</Badge>
              )}
            </>
          )}
        </MetaRow>
      )}

      <Section>
        <Card variant="outlined">
          <CardHeader>
            <strong>Timeline do Ticket</strong>
          </CardHeader>
          <CardBody>
            {id ? (
              <ClientTimelineWidget resourceType={'TICKET'} resourceId={id} pageSize={10} />
            ) : (
              <p>Ticket não encontrado.</p>
            )}
          </CardBody>
        </Card>
      </Section>
    </PageWrap>
  );
};

export default ClientTicketDetailsPage;

const PageWrap = styled.div`
  max-width: 900px;
  margin: ${({ theme }) => theme.spacing.lg} auto;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingRow = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ErrorRow = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const MetaRow = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`;

const Section = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;