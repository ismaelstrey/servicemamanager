import { ApiService } from './api';
import type {
  ClientLoginCredentials,
  ClientLoginResponse,
  ClientRegisterData,
  ClientForgotPasswordData,
  ClientForgotPasswordResponse,
  ClientResetPasswordData,
  ClientResetPasswordResponse,
  ClientUser,
} from '../types/client';

export class ClientAuthService {
  // Login do cliente
  static async login(credentials: ClientLoginCredentials): Promise<ClientLoginResponse> {
    const res = await ApiService.post<ClientLoginResponse>('/client/auth/login', credentials);
    return res.data;
  }

  // Registro do cliente
  static async register(data: ClientRegisterData): Promise<ClientLoginResponse> {
    const res = await ApiService.post<ClientLoginResponse>('/client/auth/register', data);
    return res.data;
  }

  // Recuperação de senha
  static async forgotPassword(data: ClientForgotPasswordData): Promise<ClientForgotPasswordResponse> {
    const res = await ApiService.post<ClientForgotPasswordResponse>('/client/auth/forgot-password', data);
    return res.data;
  }

  static async resetPassword(data: ClientResetPasswordData): Promise<ClientResetPasswordResponse> {
    const res = await ApiService.post<ClientResetPasswordResponse>('/client/auth/reset-password', data);
    return res.data;
  }

  // Perfil do cliente autenticado
  static async getProfile(): Promise<ClientUser> {
    const res = await ApiService.get<{ success: boolean; data: ClientUser }>('/client/auth/profile');
    return res.data?.data;
  }

  // Helpers de sessão
  static isLoggedIn(): boolean {
    const token = localStorage.getItem('clientToken');
    const user = localStorage.getItem('clientUser');
    return !!(token && user);
  }

  static getToken(): string | null {
    return localStorage.getItem('clientToken');
  }

  static getUser(): ClientUser | null {
    const userStr = localStorage.getItem('clientUser');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static clearAuthData(): void {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
  }
}

export default ClientAuthService;