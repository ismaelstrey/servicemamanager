import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClientAuth } from '../../hooks/useClientAuth';

const ClientLoginPage: React.FC = () => {
  const { login, isLoading, error } = useClientAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/client/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password, rememberMe });
      navigate(from, { replace: true });
    } catch (e) {
      // erro já tratado no contexto
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '64px auto', padding: 24 }}>
      <h1>Portal do Cliente</h1>
      <p style={{ color: '#666' }}>Acesse suas ordens de serviço e tickets.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="cliente@exemplo.com"
            style={{ width: '100%', padding: '8px 10px' }}
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{ width: '100%', padding: '8px 10px' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Lembrar-me
        </label>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <button type="submit" disabled={isLoading} style={{ padding: '10px 12px' }}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default ClientLoginPage;