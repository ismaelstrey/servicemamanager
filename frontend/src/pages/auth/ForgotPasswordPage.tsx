import React from 'react';
import styled from 'styled-components';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
`;
const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Title>Recuperar senha</Title>
            <Subtitle>Informe seu e-mail para receber o link de recuperação.</Subtitle>
          </div>
          <ForgotPasswordForm onSuccess={() => { /* mantém fluxo simples, volta para login */ window.location.href = '/login'; }} onBack={() => { window.location.href = '/login'; }} />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;