import { ApiService } from './api';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  VerifyEmailData,
  RefreshTokenData,
  AuthUser,
} from '../types/auth';
import type { UserSession } from '../types/user';

export class AuthService {
  // Login
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await ApiService.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  // Registro
  static async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await ApiService.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await ApiService.post('/auth/logout');
    } catch (error) {
      // Ignorar erros de logout, pois o token pode já estar inválido
      console.warn('Erro ao fazer logout no servidor:', error);
    }
  }

  // Refresh token
  static async refreshToken(data: RefreshTokenData): Promise<{ token: string; refreshToken?: string }> {
    const response = await ApiService.post<{ token: string; refreshToken?: string }>('/auth/refresh', data);
    return response.data;
  }

  // Esqueci minha senha
  static async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await ApiService.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  }

  // Resetar senha
  static async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await ApiService.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  }

  // Alterar senha
  static async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await ApiService.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  }

  // Verificar email
  static async verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    const response = await ApiService.post<{ message: string }>('/auth/verify-email', data);
    return response.data;
  }

  // Reenviar email de verificação
  static async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await ApiService.post<{ message: string }>('/auth/resend-verification');
    return response.data;
  }

  // Obter perfil do usuário atual
  static async getProfile(): Promise<AuthUser> {
    const response = await ApiService.get<AuthUser>('/auth/profile');
    return response.data;
  }

  // Atualizar perfil do usuário
  static async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    const response = await ApiService.put<AuthUser>('/auth/profile', data);
    return response.data;
  }

  // Verificar se o token é válido
  static async validateToken(): Promise<{ valid: boolean; user?: AuthUser }> {
    try {
      const response = await ApiService.get<{ valid: boolean; user: AuthUser }>('/auth/validate');
      return response.data;
    } catch {
      return { valid: false };
    }
  }

  // Obter sessões ativas
  static async getActiveSessions(): Promise<UserSession[]> {
    const response = await ApiService.get<UserSession[]>('/auth/sessions');
    return response.data;
  }

  // Revogar sessão
  static async revokeSession(sessionId: string): Promise<{ message: string }> {
    const response = await ApiService.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
    return response.data;
  }

  // Revogar todas as sessões (exceto a atual)
  static async revokeAllSessions(): Promise<{ message: string }> {
    const response = await ApiService.delete<{ message: string }>('/auth/sessions');
    return response.data;
  }

  // Habilitar 2FA
  static async enable2FA(): Promise<{ qrCode: string; secret: string; backupCodes: string[] }> {
    const response = await ApiService.post<{ qrCode: string; secret: string; backupCodes: string[] }>('/auth/2fa/enable');
    return response.data;
  }

  // Confirmar 2FA
  static async confirm2FA(data: { token: string; secret: string }): Promise<{ message: string; backupCodes: string[] }> {
    const response = await ApiService.post<{ message: string; backupCodes: string[] }>('/auth/2fa/confirm', data);
    return response.data;
  }

  // Desabilitar 2FA
  static async disable2FA(data: { token: string }): Promise<{ message: string }> {
    const response = await ApiService.post<{ message: string }>('/auth/2fa/disable', data);
    return response.data;
  }

  // Gerar novos códigos de backup
  static async generateBackupCodes(): Promise<{ backupCodes: string[] }> {
    const response = await ApiService.post<{ backupCodes: string[] }>('/auth/2fa/backup-codes');
    return response.data;
  }

  // Verificar 2FA
  static async verify2FA(data: { token: string }): Promise<{ valid: boolean }> {
    const response = await ApiService.post<{ valid: boolean }>('/auth/2fa/verify', data);
    return response.data;
  }

  // Obter configurações de segurança
  static async getSecuritySettings(): Promise<Record<string, unknown>> {
    const response = await ApiService.get<Record<string, unknown>>('/auth/security');
    return response.data;
  }

  // Atualizar configurações de segurança
  static async updateSecuritySettings(data: Record<string, unknown>): Promise<{ message: string }> {
    const response = await ApiService.put<{ message: string }>('/auth/security', data);
    return response.data;
  }

  // Obter log de atividades de segurança
  static async getSecurityLog(): Promise<Record<string, unknown>[]> {
    const response = await ApiService.get<Record<string, unknown>[]>('/auth/security/log');
    return response.data;
  }

  // Verificar força da senha
  static checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    // Verificar comprimento
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Use pelo menos 8 caracteres');
    }

    // Verificar letras minúsculas
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Inclua letras minúsculas');
    }

    // Verificar letras maiúsculas
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Inclua letras maiúsculas');
    }

    // Verificar números
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Inclua números');
    }

    // Verificar caracteres especiais
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Inclua caracteres especiais');
    }

    // Verificar comprimento maior
    if (password.length >= 12) {
      score += 1;
    }

    return {
      score,
      feedback,
      isStrong: score >= 4,
    };
  }

  // Validar email
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Gerar token temporário para recuperação
  static generateTempToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Verificar se o usuário está logado
  static isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Obter token do localStorage
  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obter usuário do localStorage
  static getUser(): AuthUser | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erro ao parsear usuário do localStorage:', error);
        return null;
      }
    }
    return null;
  }

  // Limpar dados de autenticação
  static clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  }
}