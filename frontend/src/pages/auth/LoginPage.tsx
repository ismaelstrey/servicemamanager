import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';

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

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__brand">
          <div className="brand-logo">
        <img src="/images/logo.svg" alt="TelecomAI" loading="lazy" />
          </div>
          <h1>TelecomAI</h1>
          <p>Sistema de Gestão de Tickets e Ordens de Serviço</p>
        </div>

        <div className="auth-page__form">
          <div className="auth-form-container">
            {renderAuthForm()}
          </div>
        </div>
      </div>

      <div className="auth-page__background">
        <div className="background-pattern"></div>
      </div>

      <div className="auth-page__footer">
        <p>&copy; 2024 TelecomAI. Todos os direitos reservados.</p>
        <div className="footer-links">
          <a href="/terms">Termos de Uso</a>
          <a href="/privacy">Política de Privacidade</a>
          <a href="/support">Suporte</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;