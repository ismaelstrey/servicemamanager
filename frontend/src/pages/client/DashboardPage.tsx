import React, { useEffect, useState } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import ClientAuthService from '../../services/clientAuthService';
import type { ClientUser } from '../../types/client';

const ClientDashboardPage: React.FC = () => {
  const { user } = useClientAuth();
  const [profile, setProfile] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    </div>
  );
};

export default ClientDashboardPage;