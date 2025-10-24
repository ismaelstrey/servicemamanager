import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { RegisterData } from '../../types/auth';
import { AuthService } from '../../services/authService';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onLogin,
}) => {
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
    if (score <= 2) return 'red';
    if (score <= 4) return 'orange';
    return 'green';
  };

  const getPasswordStrengthText = (score: number): string => {
    if (score <= 2) return 'Fraca';
    if (score <= 4) return 'Média';
    return 'Forte';
  };

  return (
    <div className="register-form">
      <div className="register-form__header">
        <h2>Criar Conta</h2>
        <p>Preencha os dados para criar sua conta</p>
      </div>

      <form onSubmit={handleSubmit} className="register-form__form">
        {error && (
          <div className="alert alert--error">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Nome Completo
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`form-input ${formErrors.name ? 'form-input--error' : ''}`}
            placeholder="Seu nome completo"
            autoComplete="name"
            disabled={loading}
          />
          {formErrors.name && (
            <span className="form-error">{formErrors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${formErrors.email ? 'form-input--error' : ''}`}
            placeholder="seu@email.com"
            autoComplete="email"
            disabled={loading}
          />
          {formErrors.email && (
            <span className="form-error">{formErrors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Senha
          </label>
          <div className="form-input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${formErrors.password ? 'form-input--error' : ''}`}
              placeholder="Sua senha"
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              className="form-input-addon"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {passwordStrength && formData.password && (
            <div className="password-strength">
              <div className="password-strength__bar">
                <div
                  className="password-strength__fill"
                  style={{
                    width: `${(passwordStrength.score / 6) * 100}%`,
                    backgroundColor: getPasswordStrengthColor(passwordStrength.score),
                  }}
                />
              </div>
              <span
                className="password-strength__text"
                style={{ color: getPasswordStrengthColor(passwordStrength.score) }}
              >
                {getPasswordStrengthText(passwordStrength.score)}
              </span>
            </div>
          )}
          
          {formErrors.password && (
            <span className="form-error">{formErrors.password}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirmar Senha
          </label>
          <div className="form-input-group">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`form-input ${formErrors.confirmPassword ? 'form-input--error' : ''}`}
              placeholder="Confirme sua senha"
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              className="form-input-addon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <span className="form-error">{formErrors.confirmPassword}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              disabled={loading}
            />
            <span className="form-checkbox__checkmark"></span>
            Aceito os{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              termos de uso
            </a>{' '}
            e{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              política de privacidade
            </a>
          </label>
          {formErrors.acceptTerms && (
            <span className="form-error">{formErrors.acceptTerms}</span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--full"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Criando conta...
            </>
          ) : (
            'Criar Conta'
          )}
        </button>

        {onLogin && (
          <div className="register-form__footer">
            <p>
              Já tem uma conta?{' '}
              <button
                type="button"
                className="link-button"
                onClick={onLogin}
                disabled={loading}
              >
                Fazer login
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;