// Tipos de usuário do sistema

import { AuditFields, Status, UserPermissions } from './common.types';
import { UserRole } from './auth.types';

// Tipo principal do usuário
export interface User extends AuditFields {
  id: number;
  name: string;
  email: string;
  password?: string; // Opcional para não expor em responses
  role: UserRole;
  status: Status;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  avatar?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  preferences?: UserPreferences;
  providers?: UserProvider[];
}

// Tipos de preferências do usuário
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  ticketUpdates: boolean;
  equipmentAlerts: boolean;
  systemMaintenance: boolean;
  securityAlerts: boolean;
}

export interface DashboardPreferences {
  defaultView: 'grid' | 'list' | 'kanban';
  widgetsOrder: string[];
  refreshInterval: number;
  showWelcome: boolean;
}

// Tipos de relacionamento usuário-provedor
export interface UserProvider extends AuditFields {
  id: number;
  userId: number;
  providerId: number;
  role: UserRole;
  permissions: UserPermissions;
  status: Status;
  invitedBy?: number;
  invitedAt?: Date;
  acceptedAt?: Date;
  user?: User;
  provider?: any; // Será definido em provider.types.ts
}

// DTOs para criação de usuário
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  timezone?: string;
  language?: string;
}

export interface CreateUserResponse {
  user: Omit<User, 'password'>;
  temporaryPassword?: string;
  inviteToken?: string;
}

// DTOs para atualização de usuário
export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UpdateUserResponse {
  user: Omit<User, 'password'>;
  message: string;
}

// DTOs para listagem de usuários
export interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: Status;
  providerId?: number;
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: Status;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  providers?: {
    id: number;
    name: string;
    role: UserRole;
  }[];
}

// Tipos de convite de usuário
export interface UserInvite extends AuditFields {
  id: string;
  email: string;
  role: UserRole;
  providerId?: number;
  invitedBy: number;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
}

export interface InviteUserDto {
  email: string;
  role: UserRole;
  providerId?: number;
  message?: string;
}

export interface AcceptInviteDto {
  token: string;
  name: string;
  password: string;
}

// Tipos de perfil do usuário
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  preferences: UserPreferences;
  providers: {
    id: number;
    name: string;
    workspace: string;
    role: UserRole;
    permissions: string[];
  }[];
  stats: {
    ticketsCreated: number;
    ticketsResolved: number;
    equipmentsManaged: number;
    lastActivity: Date;
  };
}

// Tipos de atividade do usuário
export interface UserActivity extends AuditFields {
  id: number;
  userId: number;
  action: string;
  resource: string;
  resourceId?: number;
  providerId?: number;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

export type UserActivityAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import';

// Tipos de estatísticas do usuário
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<UserRole, number>;
  usersByStatus: Record<Status, number>;
  averageLoginFrequency: number;
  topActiveUsers: {
    id: number;
    name: string;
    email: string;
    activityCount: number;
    lastActivity: Date;
  }[];
}