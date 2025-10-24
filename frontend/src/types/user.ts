// Tipos de usuário do sistema

import type { AuditFields, Status } from './common';
import type { UserRole, UserPreferences } from './auth';

// Tipo principal do usuário
export interface User extends AuditFields {
  id: number;
  name: string;
  email: string;
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
  providerId?: number;
  provider?: UserProvider;
}

// Tipos de provedor do usuário
export interface UserProvider {
  id: number;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  logo?: string;
  status: Status;
}

// Tipos para criação de usuário
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  timezone?: string;
  language?: string;
  providerId?: number;
}

// Tipos para atualização de usuário
export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

// Tipos para filtros de usuário
export interface UserFilters {
  role?: UserRole;
  status?: Status;
  providerId?: number;
  emailVerified?: boolean;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  lastLoginFrom?: Date;
  lastLoginTo?: Date;
}

// Tipos para perfil do usuário
export interface UserProfile extends User {
  statistics?: UserStatistics;
  recentActivity?: UserActivity[];
}

export interface UserStatistics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  totalServiceOrders: number;
  completedServiceOrders: number;
  averageResponseTime: number;
  customerSatisfaction: number;
}

export interface UserActivity {
  id: string;
  type: 'ticket_created' | 'ticket_updated' | 'service_order_created' | 'service_order_updated' | 'comment_added';
  description: string;
  resourceId: number;
  resourceType: 'ticket' | 'service_order';
  timestamp: Date;
  metadata?: Record<string, string | number | boolean>;
}

// Tipos para configurações de usuário
export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
}

export interface NotificationSettings {
  email: {
    ticketUpdates: boolean;
    serviceOrderUpdates: boolean;
    systemAlerts: boolean;
    weeklyReport: boolean;
  };
  push: {
    enabled: boolean;
    ticketUpdates: boolean;
    serviceOrderUpdates: boolean;
    systemAlerts: boolean;
  };
  sms: {
    enabled: boolean;
    urgentOnly: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'team_only';
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  shareActivityStatus: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  allowMultipleSessions: boolean;
  trustedDevices: TrustedDevice[];
}

export interface TrustedDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  lastUsed: Date;
  location?: string;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  density: 'compact' | 'comfortable' | 'spacious';
}

// Tipos para convites de usuário
export interface UserInvite {
  id: string;
  email: string;
  role: UserRole;
  providerId?: number;
  invitedBy: number;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token: string;
}

export interface CreateUserInviteData {
  email: string;
  role: UserRole;
  providerId?: number;
  message?: string;
}

// Tipos para sessões de usuário
export interface UserSession {
  id: string;
  userId: number;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  location?: {
    country: string;
    city: string;
    ip: string;
  };
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
  isCurrent: boolean;
}