import React from 'react';
import styled from 'styled-components';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import { useLocation } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
`;
const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ResetPasswordPage: React.FC = () => {
  const query = useQuery();
  const token = query.get('token') || undefined;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Title>Redefinir senha</Title>
            <Subtitle>Crie uma nova senha para sua conta.</Subtitle>
          </div>
          <ResetPasswordForm token={token} onSuccess={() => { window.location.href = '/login'; }} onBack={() => { window.location.href = '/login'; }} />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;