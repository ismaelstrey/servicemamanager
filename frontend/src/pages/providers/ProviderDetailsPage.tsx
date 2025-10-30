import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    <div className="provider-details-page" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Detalhes do Provedor</h1>
        <Button variant="outline" onClick={() => navigate('/providers')}>Voltar</Button>
      </div>

      {error && (
        <Alert variant="error" title="Erro">
          {error}
        </Alert>
      )}

      {loading ? (
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
          <Spinner size="md" label="Carregando detalhes..." />
        </div>
      ) : provider ? (
        <Card variant="elevated">
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 8 }}>{provider.name}</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                {provider.plan && <Badge variant="info">{provider.plan}</Badge>}
                {provider.status && (
                  <Badge variant={provider.status === 'active' ? 'success' : 'warning'}>{provider.status}</Badge>
                )}
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <div><strong>Workspace:</strong> {provider.workspace}</div>
                <div><strong>E-mail:</strong> {provider.email || '-'}</div>
                <div><strong>CNPJ:</strong> {provider.cnpj || '-'}</div>
                <div><strong>Criado em:</strong> {provider.createdAt ? new Date(provider.createdAt).toLocaleString() : '-'}</div>
                <div><strong>Atualizado em:</strong> {provider.updatedAt ? new Date(provider.updatedAt).toLocaleString() : '-'}</div>
              </div>
            </div>

            <div>
              <h3 style={{ marginTop: 0 }}>Estatísticas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Card variant="outlined">
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Usuários</div>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{provider.usersCount ?? '-'}</div>
                  </div>
                </Card>
                <Card variant="outlined">
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Equipamentos</div>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{provider.equipmentsCount ?? '-'}</div>
                  </div>
                </Card>
                <Card variant="outlined">
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Tickets</div>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{provider.ticketsCount ?? '-'}</div>
                  </div>
                </Card>
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <Button onClick={() => navigate(`/dashboard?provider=${provider.id}`)}>Ver Dashboard</Button>
                <Button variant="outline" onClick={() => navigate(`/providers/${provider.id}/settings`)}>Configurações</Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Alert variant="warning" title="Aviso">
          Provedor não encontrado.
        </Alert>
      )}
    </div>
  );
};

export default ProviderDetailsPage;