// Tipos de autenticação do Portal do Cliente

export interface ClientLoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ClientRegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  providerId: number;
  phone?: string;
  document?: string;
}

export interface ClientUser {
  id: number;
  name: string;
  email: string;
  providerId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientLoginResponse {
  token: string;
  customer: ClientUser;
}

export interface ClientForgotPasswordData {
  email: string;
}

export interface ClientForgotPasswordResponse {
  success: boolean;
  message: string;
  token?: string; // Apenas em dev
}

export interface ClientResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ClientResetPasswordResponse {
  success: boolean;
  message: string;
}