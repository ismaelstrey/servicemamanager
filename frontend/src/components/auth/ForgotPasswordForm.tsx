import React, { useState } from 'react';
import { AuthService } from '../../services/authService';
import type { ForgotPasswordData } from '../../types/auth';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

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
      <div className="forgot-password-form">
        <div className="forgot-password-form__success">
          <div className="success-icon">✅</div>
          <h2>Email Enviado!</h2>
          <p>
            Enviamos um link de recuperação para <strong>{formData.email}</strong>.
            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
          </p>
          <p className="text-muted">
            Não recebeu o email? Verifique sua pasta de spam ou tente novamente em alguns minutos.
          </p>
          {onBack && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onBack}
            >
              Voltar ao Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-form">
      <div className="forgot-password-form__header">
        <h2>Recuperar Senha</h2>
        <p>Digite seu email para receber um link de recuperação</p>
      </div>

      <form onSubmit={handleSubmit} className="forgot-password-form__form">
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
            autoFocus
          />
          {formErrors.email && (
            <span className="form-error">{formErrors.email}</span>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Enviando...
              </>
            ) : (
              'Enviar Link de Recuperação'
            )}
          </button>

          {onBack && (
            <button
              type="button"
              className="btn btn--ghost btn--full"
              onClick={onBack}
              disabled={loading}
            >
              Voltar ao Login
            </button>
          )}
        </div>
      </form>

      <div className="forgot-password-form__help">
        <h4>Precisa de ajuda?</h4>
        <ul>
          <li>Verifique se o email está correto</li>
          <li>Procure na pasta de spam</li>
          <li>O link expira em 1 hora</li>
          <li>Entre em contato com o suporte se o problema persistir</li>
        </ul>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;