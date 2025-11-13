import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import type { LoginCredentials } from '../../types/auth';
import { Input, Button, Alert, Checkbox } from '../../components/ui';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onForgotPassword,
  onRegister,
}) => {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<LoginCredentials>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};

    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      onSuccess?.();
    } catch (err) {
      // Erro já é tratado no contexto
      console.error('Erro no login:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[name as keyof LoginCredentials]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Wrapper>
      <Header>
        <Title>Entrar</Title>
        <Description>Acesse sua conta para continuar</Description>
      </Header>

      <Form onSubmit={handleSubmit}>
        {error && (<Alert variant="error">{error}</Alert>)}

        <Input
          label="Email"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="seu@email.com"
          autoComplete="email"
          disabled={loading}
          error={formErrors.email || undefined}
          fullWidth
        />

        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Sua senha"
          autoComplete="current-password"
          disabled={loading}
          error={formErrors.password || undefined}
          rightAddon={(
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </Button>
          )}
          fullWidth
        />

        <Row>
          <Checkbox
            label="Lembrar de mim"
            checked={formData.rememberMe}
            onChange={(e) => handleInputChange({ target: { name: 'rememberMe', type: 'checkbox', checked: (e.target as HTMLInputElement).checked } } as any)}
            disabled={loading}
          />
          {onForgotPassword && (
            <Button type="button" variant="link" onClick={onForgotPassword} disabled={loading}>Esqueci minha senha</Button>
          )}
        </Row>

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        {onRegister && (
          <div>
            <p>
              Não tem uma conta?{' '}
              <Button type="button" variant="link" onClick={onRegister} disabled={loading}>Criar conta</Button>
            </p>
          </div>
        )}
      </Form>
    </Wrapper>
  );
};

export default LoginForm;