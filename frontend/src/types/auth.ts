// Tipos de autenticação e autorização

// Tipos de login
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
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
  confirmPassword: string;
  role?: UserRole;
  acceptTerms?: boolean;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
  requiresEmailVerification?: boolean;
}

// Tipos de verificação de email
export interface VerifyEmailData {
  token: string;
  email: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: AuthUser;
}

// Tipos de recuperação de senha
export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

// Tipos de refresh token
export interface RefreshTokenData {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

// Tipos de usuário
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  timezone: string;
}

// Tipos de roles e permissões
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  GUEST = 'guest'
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

// Tipos de estado de autenticação
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Tipos de ações de autenticação
export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AuthUser; token: string; refreshToken?: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_UPDATE_USER'; payload: Partial<AuthUser> }
  | { type: 'AUTH_REFRESH_TOKEN'; payload: { token: string; refreshToken?: string } };

// Tipos de contexto de autenticação
export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

// Tipos para proteção de rotas
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}