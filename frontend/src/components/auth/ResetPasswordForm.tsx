import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AuthService } from '../../services/authService';
import type { ResetPasswordData } from '../../types/auth';
import { Input, Button, Alert } from '../../components/ui';

interface ResetPasswordFormProps {
  token?: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
  onSuccess,
  onBack,
}) => {
  const [formData, setFormData] = useState<ResetPasswordData>({
    token: token || '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<ResetPasswordData & { confirmPassword: string }>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
    isStrong: boolean;
  } | null>(null);

  useEffect(() => {
    if (token) {
      setFormData(prev => ({ ...prev, token }));
    }
  }, [token]);

  const validateForm = (): boolean => {
    const errors: Partial<ResetPasswordData & { confirmPassword: string }> = {};

    // Validar token
    if (!formData.token) {
      errors.token = 'Token de recuperação é obrigatório';
    }

    // Validar senha
    if (!formData.password) {
      errors.password = 'Nova senha é obrigatória';
    } else {
      const strength = AuthService.checkPasswordStrength(formData.password);
      if (!strength.isStrong) {
        errors.password = 'Senha muito fraca. ' + strength.feedback.join(', ');
      }
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
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
      await AuthService.resetPassword(formData);
      setSuccess(true);
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erro ao redefinir senha');
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

    // Verificar força da senha em tempo real
    if (name === 'password') {
      const strength = AuthService.checkPasswordStrength(value);
      setPasswordStrength(strength);
    }

    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[name as keyof (ResetPasswordData & { confirmPassword: string })]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Limpar mensagens de erro
    if (error) setError(null);
  };

  const getPasswordStrengthColor = (score: number): string => {
    if (score <= 2) return 'red';
    if (score <= 4) return 'orange';
    return 'green';
  };

  const getPasswordStrengthText = (score: number): string => {
    if (score <= 2) return 'Fraca';
    if (score <= 4) return 'Média';
    return 'Forte';
  };
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
  const StrengthBar = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
  `;
  const Bar = styled.div`
    width: 100%;
    height: 6px;
    background: ${({ theme }) => theme.colors.neutral[200]};
    border-radius: ${({ theme }) => theme.borders.radius.sm};
    overflow: hidden;
  `;
  const Fill = styled.div<{ $width: number; $color: string }>`
    width: ${({ $width }) => `${$width}%`};
    height: 100%;
    background: ${({ $color }) => $color};
  `;

  if (success) {
    return (
      <Wrapper>
        <Alert variant="success" title="Senha Redefinida!">
          Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
        </Alert>
        {onBack && (
          <Button type="button" variant="primary" onClick={onBack}>Ir para Login</Button>
        )}
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Header>
        <Title>Redefinir Senha</Title>
        <Description>Digite sua nova senha</Description>
      </Header>

      <Form onSubmit={handleSubmit}>
        {error && (<Alert variant="error">{error}</Alert>)}

        {!token && (
          <Input
            label="Token de Recuperação"
            id="token"
            name="token"
            value={formData.token}
            onChange={handleInputChange}
            placeholder="Cole aqui o token recebido por email"
            disabled={loading}
            error={(formErrors as any).token || undefined}
            fullWidth
          />
        )}

        <Input
          label="Nova Senha"
          type={showPassword ? 'text' : 'password'}
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Sua nova senha"
          autoComplete="new-password"
          disabled={loading}
          error={formErrors.password || undefined}
          rightAddon={(
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </Button>
          )}
          fullWidth
        />
          
          {passwordStrength && formData.password && (
            <StrengthBar>
              <Bar>
                <Fill $width={(passwordStrength.score / 6) * 100} $color={getPasswordStrengthColor(passwordStrength.score)} />
              </Bar>
              <span style={{ color: getPasswordStrengthColor(passwordStrength.score) }}>
                {getPasswordStrengthText(passwordStrength.score)}
              </span>
            </StrengthBar>
          )}
          
          {formErrors.password && (<Alert variant="warning">{formErrors.password}</Alert>)}

        <Input
          label="Confirmar Nova Senha"
          type={showConfirmPassword ? 'text' : 'password'}
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirme sua nova senha"
          autoComplete="new-password"
          disabled={loading}
          error={formErrors.confirmPassword || undefined}
          rightAddon={(
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
              {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
            </Button>
          )}
          fullWidth
        />

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? 'Redefinindo...' : 'Redefinir Senha'}
        </Button>

        {onBack && (
          <Button type="button" variant="ghost" fullWidth onClick={onBack} disabled={loading}>Voltar</Button>
        )}
      </Form>

      <div>
        <h4>Dicas para uma senha segura:</h4>
        <ul>
          <li>Use pelo menos 8 caracteres</li>
          <li>Inclua letras maiúsculas e minúsculas</li>
          <li>Adicione números e símbolos</li>
          <li>Evite informações pessoais</li>
        </ul>
      </div>
    </Wrapper>
  );
};

export default ResetPasswordForm;