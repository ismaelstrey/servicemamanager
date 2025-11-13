import React, { useState } from 'react';
import styled from 'styled-components';
import { AuthService } from '../../services/authService';
import type { ForgotPasswordData } from '../../types/auth';
import { Input, Button, Alert } from '../../components/ui';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
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

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBack,
}) => {
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<ForgotPasswordData>>({});

  const validateForm = (): boolean => {
    const errors: Partial<ForgotPasswordData> = {};

    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!AuthService.validateEmail(formData.email)) {
      errors.email = 'Email inválido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await AuthService.forgotPassword(formData);
      setSuccess(true);
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[name as keyof ForgotPasswordData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Limpar mensagens de erro/sucesso
    if (error) setError(null);
  };

  if (success) {
    return (
      <Wrapper>
        <Alert variant="success" title="Email Enviado!" description={
          <>Enviamos um link de recuperação para <strong>{formData.email}</strong>. Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</>
        }>
          Não recebeu o email? Verifique sua pasta de spam ou tente novamente em alguns minutos.
        </Alert>
        {onBack && (
          <Button variant="secondary" type="button" onClick={onBack}>Voltar ao Login</Button>
        )}
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Header>
        <Title>Recuperar Senha</Title>
        <Description>Digite seu email para receber um link de recuperação</Description>
      </Header>

      <Form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="error">{error}</Alert>
        )}

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
          autoFocus
          error={formErrors.email || undefined}
          fullWidth
        />

        <Actions>
          <Button variant="primary" type="submit" disabled={loading} fullWidth>
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </Button>

          {onBack && (
            <Button variant="ghost" type="button" onClick={onBack} disabled={loading} fullWidth>
              Voltar ao Login
            </Button>
          )}
        </Actions>
      </Form>

      <div>
        <h4>Precisa de ajuda?</h4>
        <ul>
          <li>Verifique se o email está correto</li>
          <li>Procure na pasta de spam</li>
          <li>O link expira em 1 hora</li>
          <li>Entre em contato com o suporte se o problema persistir</li>
        </ul>
      </div>
    </Wrapper>
  );
};

export default ForgotPasswordForm;