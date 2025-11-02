import React from 'react';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Recuperar senha</h1>
            <p className="auth-subtitle">Informe seu e-mail para receber o link de recuperação.</p>
          </div>
          <ForgotPasswordForm onSuccess={() => { /* mantém fluxo simples, volta para login */ window.location.href = '/login'; }} onBack={() => { window.location.href = '/login'; }} />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;