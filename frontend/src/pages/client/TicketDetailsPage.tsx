import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    <div style={{ maxWidth: 900, margin: '32px auto', padding: 24 }}>
      <h1>Ticket #{id}</h1>
      <p style={{ color: '#666' }}>Detalhes do ticket no Portal do Cliente</p>

      {loading && (
        <div style={{ marginTop: 12 }}>
          <Spinner />
        </div>
      )}
      {error && (
        <div style={{ marginTop: 12 }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {details?.ticket && (
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
        </div>
      )}

      <div style={{ marginTop: 16 }}>
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
      </div>
    </div>
  );
};

export default ClientTicketDetailsPage;