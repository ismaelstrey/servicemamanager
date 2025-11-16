import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import type { RegisterData } from '../../types/auth';
import { AuthService } from '../../services/authService';
import { Input, Button, Alert, Checkbox } from '../../components/ui';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
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

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StrengthLabel = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
`;

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onLogin,
}) => {
  const theme = useTheme();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
    isStrong: boolean;
  } | null>(null);

  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      acceptTerms?: string;
    } = {};

    // Validar nome
    if (!formData.name) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!AuthService.validateEmail(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
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

    // Validar termos
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Você deve aceitar os termos de uso';
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
      await register(formData);
      onSuccess?.();
    } catch (err) {
      // Erro já é tratado no contexto
      console.error('Erro no registro:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Verificar força da senha em tempo real
    if (name === 'password' && typeof newValue === 'string') {
      const strength = AuthService.checkPasswordStrength(newValue);
      setPasswordStrength(strength);
    }

    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const getPasswordStrengthColor = (score: number): string => {
    if (score <= 2) return theme.colors.error.main;
    if (score <= 4) return theme.colors.warning.main;
    return theme.colors.success.main;
  };

  const getPasswordStrengthText = (score: number): string => {
    if (score <= 2) return 'Fraca';
    if (score <= 4) return 'Média';
    return 'Forte';
  };


  return (
    <Wrapper>
      <Header>
        <Title>Criar Conta</Title>
        <Description>Preencha os dados para criar sua conta</Description>
      </Header>

      <Form onSubmit={handleSubmit}>
        {error && (<Alert variant="error">{error}</Alert>)}

        <Input
          label="Nome Completo"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Seu nome completo"
          autoComplete="name"
          disabled={loading}
          error={formErrors.name || undefined}
          fullWidth
        />

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
            <StrengthLabel $color={getPasswordStrengthColor(passwordStrength.score)}>
              {getPasswordStrengthText(passwordStrength.score)}
            </StrengthLabel>
          </StrengthBar>
        )}

        <Input
          label="Confirmar Senha"
          type={showConfirmPassword ? 'text' : 'password'}
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirme sua senha"
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

        <Row>
          <Checkbox
            label={(
              <>
                Aceito os <a href="/terms" target="_blank" rel="noopener noreferrer">termos de uso</a> e <a href="/privacy" target="_blank" rel="noopener noreferrer">política de privacidade</a>
              </>
            ) as any}
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange({ target: { name: 'acceptTerms', type: 'checkbox', checked: (e.target as HTMLInputElement).checked } } as any)}
            disabled={loading}
          />
        </Row>
        {formErrors.acceptTerms && (<Alert variant="warning">{formErrors.acceptTerms}</Alert>)}

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </Button>

        {onLogin && (
          <div>
            <p>
              Já tem uma conta?{' '}
              <Button type="button" variant="link" onClick={onLogin} disabled={loading}>Fazer login</Button>
            </p>
          </div>
        )}
      </Form>
    </Wrapper>
  );
};

export default RegisterForm;
