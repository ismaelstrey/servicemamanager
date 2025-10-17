// Tipos de provedor de serviços de internet

import { AuditFields, Status, ContactInfo, Address } from './common.types';
import { UserRole } from './auth.types';

// Tipo principal do provedor
export interface Provider extends AuditFields {
  id: number;
  name: string;
  workspace: string; // Identificador único do workspace
  cnpj: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  description?: string;
  status: Status;
  plan: ProviderPlan;
  planExpiresAt?: Date;
  settings: ProviderSettings;
  address: Address;
  contactInfo: ContactInfo;
  billingInfo?: BillingInfo;
  stats?: ProviderStats;
  users?: ProviderUser[];
  equipments?: any[]; // Será definido em equipment.types.ts
  tickets?: any[]; // Será definido em ticket.types.ts
  zabbixServers?: any[]; // Será definido em zabbix.types.ts
}

// Tipos de plano do provedor
export type ProviderPlan = 
  | 'free'        // Plano gratuito
  | 'basic'       // Plano básico
  | 'professional' // Plano profissional
  | 'enterprise'; // Plano empresarial

export interface PlanFeatures {
  maxUsers: number;
  maxEquipments: number;
  maxTicketsPerMonth: number;
  maxStorageGB: number;
  hasZabbixIntegration: boolean;
  hasAdvancedReports: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
  hasCustomBranding: boolean;
  hasBackupRestore: boolean;
  retentionDays: number;
}

export const PLAN_FEATURES: Record<ProviderPlan, PlanFeatures> = {
  free: {
    maxUsers: 2,
    maxEquipments: 50,
    maxTicketsPerMonth: 100,
    maxStorageGB: 1,
    hasZabbixIntegration: false,
    hasAdvancedReports: false,
    hasApiAccess: false,
    hasPrioritySupport: false,
    hasCustomBranding: false,
    hasBackupRestore: false,
    retentionDays: 30
  },
  basic: {
    maxUsers: 5,
    maxEquipments: 200,
    maxTicketsPerMonth: 500,
    maxStorageGB: 5,
    hasZabbixIntegration: true,
    hasAdvancedReports: false,
    hasApiAccess: true,
    hasPrioritySupport: false,
    hasCustomBranding: false,
    hasBackupRestore: true,
    retentionDays: 90
  },
  professional: {
    maxUsers: 15,
    maxEquipments: 1000,
    maxTicketsPerMonth: 2000,
    maxStorageGB: 20,
    hasZabbixIntegration: true,
    hasAdvancedReports: true,
    hasApiAccess: true,
    hasPrioritySupport: true,
    hasCustomBranding: true,
    hasBackupRestore: true,
    retentionDays: 180
  },
  enterprise: {
    maxUsers: -1, // Ilimitado
    maxEquipments: -1, // Ilimitado
    maxTicketsPerMonth: -1, // Ilimitado
    maxStorageGB: 100,
    hasZabbixIntegration: true,
    hasAdvancedReports: true,
    hasApiAccess: true,
    hasPrioritySupport: true,
    hasCustomBranding: true,
    hasBackupRestore: true,
    retentionDays: 365
  }
};

// Configurações do provedor
export interface ProviderSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  ticketSettings: TicketSettings;
  notificationSettings: NotificationSettings;
  securitySettings: SecuritySettings;
  integrationSettings: IntegrationSettings;
  brandingSettings?: BrandingSettings;
}

export interface TicketSettings {
  autoAssignment: boolean;
  defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
  escalationRules: ProviderEscalationRule[];
  slaSettings: SlaSettings;
  customFields: CustomField[];
}

export interface ProviderEscalationRule {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeToEscalate: number; // em minutos
  escalateTo: UserRole;
  enabled: boolean;
}

export interface SlaSettings {
  enabled: boolean;
  responseTime: Record<string, number>; // priority -> minutes
  resolutionTime: Record<string, number>; // priority -> hours
  businessHours: BusinessHours;
}

export interface BusinessHours {
  monday: TimeRange;
  tuesday: TimeRange;
  wednesday: TimeRange;
  thursday: TimeRange;
  friday: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
  holidays: string[]; // ISO dates
}

export interface TimeRange {
  start: string; // HH:mm
  end: string; // HH:mm
  enabled: boolean;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean';
  required: boolean;
  options?: string[]; // Para select/multiselect
  defaultValue?: any;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  webhookUrl?: string;
  notifyOnTicketCreate: boolean;
  notifyOnTicketUpdate: boolean;
  notifyOnTicketClose: boolean;
  notifyOnEquipmentAlert: boolean;
}

export interface SecuritySettings {
  requireTwoFactor: boolean;
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number; // em minutos
  ipWhitelist: string[];
  allowApiAccess: boolean;
  auditLogRetention: number; // em dias
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxAge: number; // em dias
  preventReuse: number; // últimas N senhas
}

export interface IntegrationSettings {
  zabbixEnabled: boolean;
  apiEnabled: boolean;
  webhooksEnabled: boolean;
  allowedOrigins: string[];
  rateLimiting: RateLimitSettings;
}

export interface RateLimitSettings {
  enabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  favicon?: string;
  customCss?: string;
  footerText?: string;
}

// Informações de cobrança
export interface BillingInfo {
  companyName: string;
  cnpj: string;
  address: Address;
  contactEmail: string;
  contactPhone: string;
  paymentMethod?: PaymentMethod;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate?: Date;
  lastPaymentDate?: Date;
  totalPaid: number;
}

export interface PaymentMethod {
  type: 'credit_card' | 'bank_transfer' | 'pix';
  lastFour?: string;
  expiryDate?: string;
  cardBrand?: string;
}

// Relacionamento usuário-provedor
export interface ProviderUser {
  id: number;
  userId: number;
  providerId: number;
  role: UserRole;
  permissions: string[];
  status: Status;
  invitedBy?: number;
  invitedAt?: Date;
  acceptedAt?: Date;
  user?: any; // Será definido em user.types.ts
}

// DTOs para criação de provedor
export interface CreateProviderDto {
  name: string;
  workspace: string;
  cnpj: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  plan?: ProviderPlan;
  address: Omit<Address, 'id'>;
  contactInfo: Omit<ContactInfo, 'id'>;
  settings?: Partial<ProviderSettings>;
}

export interface CreateProviderResponse {
  provider: Provider;
  adminUser: {
    id: number;
    email: string;
    temporaryPassword: string;
  };
  message: string;
}

// DTOs para atualização de provedor
export interface UpdateProviderDto {
  name?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  logo?: string;
  address?: Partial<Address>;
  contactInfo?: Partial<ContactInfo>;
  settings?: Partial<ProviderSettings>;
}

export interface UpdateProviderResponse {
  provider: Provider;
  message: string;
}

// DTOs para listagem de provedores
export interface ListProvidersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: Status;
  plan?: ProviderPlan;
  userProviderId?: number; // Para filtrar por provedor específico do usuário
  sortBy?: keyof Provider;
  sortOrder?: 'asc' | 'desc';
}

export interface ProviderListItem {
  id: number;
  name: string;
  workspace: string;
  email: string;
  status: Status;
  plan: ProviderPlan;
  planExpiresAt?: Date;
  usersCount: number;
  equipmentsCount: number;
  ticketsCount: number;
  createdAt: Date;
  lastActivity?: Date;
}

// Estatísticas do provedor
export interface ProviderStats {
  totalUsers: number;
  activeUsers: number;
  totalEquipments: number;
  onlineEquipments: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number; // em horas
  customerSatisfaction?: number; // 0-5
  storageUsed: number; // em GB
  apiCallsThisMonth: number;
  lastBackup?: Date;
}

// Tipos de auditoria do provedor
export interface ProviderAuditLog extends AuditFields {
  id: number;
  providerId: number;
  userId: number;
  action: ProviderAction;
  resource: string;
  resourceId?: number;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

export type ProviderAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'activate'
  | 'deactivate'
  | 'upgrade_plan'
  | 'downgrade_plan'
  | 'add_user'
  | 'remove_user'
  | 'update_settings'
  | 'backup_create'
  | 'backup_restore';

// Tipos de workspace específicos do provedor
export interface ProviderWorkspaceInfo {
  workspace: string;
  name: string;
  status: Status;
  plan: ProviderPlan;
  features: PlanFeatures;
  usage: WorkspaceUsage;
}

export interface WorkspaceUsage {
  users: number;
  equipments: number;
  ticketsThisMonth: number;
  storageGB: number;
  apiCallsThisMonth: number;
}

// Tipos de convite para provedor
export interface ProviderInvite extends AuditFields {
  id: string; // UUID do convite
  providerId: number;
  email: string;
  role: UserRole;
  invitedBy: number;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
}

export interface InviteToProviderDto {
  email: string;
  role: UserRole;
  permissions?: string[];
  message?: string;
}