import React, { useEffect, useState } from 'react';
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
    <div style={{ maxWidth: 900, margin: '32px auto', padding: 24 }}>
      <h1>Olá, {user?.name || 'Cliente'}</h1>
      <p style={{ color: '#666' }}>Bem-vindo ao seu painel.</p>
      {loading && <p>Carregando seu perfil...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {profile && (
        <div style={{ marginTop: 16 }}>
          <h2>Seu Perfil</h2>
          <ul>
            <li>ID: {profile.id}</li>
            <li>Nome: {profile.name}</li>
            <li>Email: {profile.email}</li>
            <li>Provider ID: {profile.providerId}</li>
          </ul>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Card variant="outlined">
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Timeline Unificada</strong>
              <small style={{ color: '#666' }}>Selecione tipo e ID do recurso</small>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Radio name="resourceType" defaultChecked onChange={() => setResourceType('TICKET')}>Ticket</Radio>
                <Radio name="resourceType" onChange={() => setResourceType('SERVICE_ORDER')}>Ordem de Serviço</Radio>
              </div>
              <Input placeholder="ID do recurso" onChange={(e: any) => setResourceId(e.target.value)} />
            </div>
            {resourceId ? (
              <ClientUnifiedTimeline resourceType={resourceType} resourceId={resourceId} pageSize={10} />
            ) : (
              <p style={{ color: '#666' }}>Informe um ID de Ticket ou OS para visualizar.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboardPage;