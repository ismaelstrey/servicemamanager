import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardBody, Badge, Spinner, Alert } from '../../components/ui';
import ClientTimelineWidget from '../../components/client/ClientTimelineWidget';
import { ApiService } from '../../services/api';

interface ClientServiceOrderDetailsResponse {
  id?: number;
  title?: string;
  status?: string;
  priority?: string;
  scheduledDate?: string;
  createdAt?: string;
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

const ClientServiceOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<ClientServiceOrderDetailsResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await ApiService.get<any>(`/client/service-orders/${id}`);
        const payload = (res.data as any)?.data ?? res.data;
        if (!isMounted) return;
        setDetails(payload);
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar OS');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [id]);

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', padding: 24 }}>
      <h1>Ordem de Serviço #{id}</h1>
      <p style={{ color: '#666' }}>Detalhes da OS no Portal do Cliente</p>

      {loading && (
        <div style={{ marginTop: 12 }}>
          <Spinner />
        </div>
      )}
      {error && (
        <div style={{ marginTop: 12 }}>
          <Alert variant='error'>{error}</Alert>
        </div>
      )}

      {details && (
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {details.status && <Badge variant="info">Status: {details.status}</Badge>}
          {details.priority && <Badge variant="secondary">Prioridade: {details.priority}</Badge>}
          {details.scheduledDate && <Badge variant="primary">Agendada: {new Date(details.scheduledDate).toLocaleString()}</Badge>}
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
            <strong>Timeline da OS</strong>
          </CardHeader>
          <CardBody>
            {id ? (
              <ClientTimelineWidget resourceType={'SERVICE_ORDER'} resourceId={id} pageSize={10} />
            ) : (
              <p>OS não encontrada.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ClientServiceOrderDetailsPage;