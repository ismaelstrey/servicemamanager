// Tipos de autenticação e autorização

import { AuditFields } from './common.types';

// Tipos de login
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: AuthUser;
  expiresIn: number;
}

// Tipos de registro
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface RegisterResponse {
  token: string;
  user: AuthUser;
  message: string;
}

// Tipos de usuário autenticado
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role?: UserRole;
  permissions?: string[];
  providerId?: number;
  lastLogin?: Date;
}

// Tipos de papel/função do usuário
export type UserRole = 
  | 'super_admin'  // Super administrador do sistema
  | 'admin'        // Administrador do provedor
  | 'manager'      // Gerente do provedor
  | 'technician'   // Técnico
  | 'support'      // Suporte
  | 'viewer';      // Visualizador

// Tipos de token JWT
export interface JwtPayload {
  userId: number;
  email: string;
  role?: UserRole;
  providerId?: number;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: number;
  tokenId: string;
  iat: number;
  exp: number;
}

// Tipos de sessão
export interface UserSession extends AuditFields {
  id: string;
  userId: number;
  token: string;
  refreshToken?: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: Date;
  lastActivity: Date;
}

// Tipos de recuperação de senha
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordResetToken extends AuditFields {
  id: string;
  userId: number;
  token: string;
  expiresAt: Date;
  used: boolean;
}

// Tipos de alteração de senha
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Tipos de verificação de email
export interface EmailVerificationToken extends AuditFields {
  id: string;
  userId: number;
  token: string;
  expiresAt: Date;
  verified: boolean;
}

// Tipos de autenticação de dois fatores (2FA)
export interface TwoFactorAuth {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  lastUsed?: Date;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyRequest {
  token: string;
  code: string;
}

// Tipos de auditoria de autenticação
export interface AuthAuditLog extends AuditFields {
  id: number;
  userId: number;
  action: AuthAction;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export type AuthAction = 
  | 'login'
  | 'logout'
  | 'register'
  | 'password_change'
  | 'password_reset'
  | 'email_verify'
  | 'token_refresh'
  | '2fa_enable'
  | '2fa_disable'
  | '2fa_verify';

// Tipos de configuração de autenticação
export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  require2FA: boolean;
  requireEmailVerification: boolean;
}

// Tipos de middleware de autenticação
export interface AuthMiddlewareOptions {
  required?: boolean;
  roles?: UserRole[];
  permissions?: string[];
  providerId?: boolean;
}