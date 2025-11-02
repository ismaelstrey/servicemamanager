import React from 'react';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import { useLocation } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPasswordPage: React.FC = () => {
  const query = useQuery();
  const token = query.get('token') || undefined;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Redefinir senha</h1>
            <p className="auth-subtitle">Crie uma nova senha para sua conta.</p>
          </div>
          <ResetPasswordForm token={token} onSuccess={() => { window.location.href = '/login'; }} onBack={() => { window.location.href = '/login'; }} />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;