import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/authService';
import type { ResetPasswordData } from '../../types/auth';

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

  if (success) {
    return (
      <div className="reset-password-form">
        <div className="reset-password-form__success">
          <div className="success-icon">✅</div>
          <h2>Senha Redefinida!</h2>
          <p>
            Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
          </p>
          {onBack && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={onBack}
            >
              Ir para Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-form">
      <div className="reset-password-form__header">
        <h2>Redefinir Senha</h2>
        <p>Digite sua nova senha</p>
      </div>

      <form onSubmit={handleSubmit} className="reset-password-form__form">
        {error && (
          <div className="alert alert--error">
            {error}
          </div>
        )}

        {!token && (
          <div className="form-group">
            <label htmlFor="token" className="form-label">
              Token de Recuperação
            </label>
            <input
              type="text"
              id="token"
              name="token"
              value={formData.token}
              onChange={handleInputChange}
              className={`form-input ${formErrors.token ? 'form-input--error' : ''}`}
              placeholder="Cole aqui o token recebido por email"
              disabled={loading}
            />
            {formErrors.token && (
              <span className="form-error">{formErrors.token}</span>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Nova Senha
          </label>
          <div className="form-input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${formErrors.password ? 'form-input--error' : ''}`}
              placeholder="Sua nova senha"
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
            Confirmar Nova Senha
          </label>
          <div className="form-input-group">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`form-input ${formErrors.confirmPassword ? 'form-input--error' : ''}`}
              placeholder="Confirme sua nova senha"
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

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Redefinindo...
              </>
            ) : (
              'Redefinir Senha'
            )}
          </button>

          {onBack && (
            <button
              type="button"
              className="btn btn--ghost btn--full"
              onClick={onBack}
              disabled={loading}
            >
              Voltar
            </button>
          )}
        </div>
      </form>

      <div className="reset-password-form__help">
        <h4>Dicas para uma senha segura:</h4>
        <ul>
          <li>Use pelo menos 8 caracteres</li>
          <li>Inclua letras maiúsculas e minúsculas</li>
          <li>Adicione números e símbolos</li>
          <li>Evite informações pessoais</li>
        </ul>
      </div>
    </div>
  );
};

export default ResetPasswordForm;