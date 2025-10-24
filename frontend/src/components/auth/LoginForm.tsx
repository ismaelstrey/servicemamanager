import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { LoginCredentials } from '../../types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

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
    <div className="login-form">
      <div className="login-form__header">
        <h2>Entrar</h2>
        <p>Acesse sua conta para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form__form">
        {error && (
          <div className="alert alert--error">
            {error}
          </div>
        )}

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
              autoComplete="current-password"
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
          {formErrors.password && (
            <span className="form-error">{formErrors.password}</span>
          )}
        </div>

        <div className="form-group form-group--row">
          <label className="form-checkbox">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={loading}
            />
            <span className="form-checkbox__checkmark"></span>
            Lembrar de mim
          </label>

          {onForgotPassword && (
            <button
              type="button"
              className="link-button"
              onClick={onForgotPassword}
              disabled={loading}
            >
              Esqueci minha senha
            </button>
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
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>

        {onRegister && (
          <div className="login-form__footer">
            <p>
              Não tem uma conta?{' '}
              <button
                type="button"
                className="link-button"
                onClick={onRegister}
                disabled={loading}
              >
                Criar conta
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;