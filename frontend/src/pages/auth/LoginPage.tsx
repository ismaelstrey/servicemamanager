import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import { AuthTemplate } from '../../components/templates';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  // Extrair token de reset da URL se presente
  const urlParams = new URLSearchParams(location.search);
  const resetToken = urlParams.get('token');

  useEffect(() => {
    // Se já estiver logado, redirecionar para dashboard
    if (user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }

    // Se houver token de reset na URL, mostrar formulário de reset
    if (resetToken) {
      setMode('reset-password');
    }
  }, [user, navigate, location, resetToken]);

  const handleAuthSuccess = () => {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  const handleForgotPasswordSuccess = () => {
    // Pode mostrar uma mensagem de sucesso ou redirecionar
    setMode('login');
  };

  const handleResetPasswordSuccess = () => {
    setMode('login');
  };

  const renderAuthForm = () => {
    switch (mode) {
      case 'register':
        return (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onLogin={() => setMode('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSuccess={handleForgotPasswordSuccess}
            onBack={() => setMode('login')}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordForm
            token={resetToken || undefined}
            onSuccess={handleResetPasswordSuccess}
            onBack={() => setMode('login')}
          />
        );
      default:
        return (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onForgotPassword={() => setMode('forgot-password')}
            onRegister={() => setMode('register')}
          />
        );
    }
  };

  const FooterText = styled.p`
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
  `;
  const FooterLinks = styled.div`
    margin-top: ${({ theme }) => theme.spacing.xs};
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
    justify-content: center;
    a { color: ${({ theme }) => theme.colors.primary.main}; text-decoration: none; }
    a:hover { text-decoration: underline; }
  `;

  return (
    <AuthTemplate
      title="TelecomAI"
      subtitle="Sistema de Gestão de Tickets e Ordens de Serviço"
      showLogo
      layout="split"
      brandLogoSrc="/images/logo.svg"
      footer={(
        <>
          <FooterText>&copy; 2024 TelecomAI. Todos os direitos reservados.</FooterText>
          <FooterLinks>
            <a href="/terms">Termos de Uso</a>
            <a href="/privacy">Política de Privacidade</a>
            <a href="/support">Suporte</a>
          </FooterLinks>
        </>
      )}
    >
      {renderAuthForm()}
    </AuthTemplate>
  );
};

export default LoginPage;
