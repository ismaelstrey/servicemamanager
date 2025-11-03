// Tipos comuns e utilitários do projeto

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Tipos de paginação
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Tipos de filtros
export interface DateFilter {
  from?: Date | string;
  to?: Date | string;
}

export interface SearchFilter {
  query?: string;
  fields?: string[];
}

// Tipos de status genéricos
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

// Tipos de prioridade
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Tipos de auditoria
export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
  updatedBy?: number;
}

// Tipos de validação
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Tipos de configuração
export interface AppConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

// Tipos de log
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  userId?: number;
  providerId?: number;
  metadata?: Record<string, any>;
}

// Tipos de endereço
export interface Address {
  id?: number;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Tipos de informações de contato
export interface ContactInfo {
  primaryPhone: string;
  secondaryPhone?: string;
  whatsapp?: string;
  email: string;
  website?: string;
}

// Tipos de workspace
export interface WorkspaceInfo {
  name: string;
  slug: string;
  domain?: string;
}

// Tipos de permissão
export type Permission =
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'
  | 'owner';

export interface UserPermissions {
  providerId: number;
  permissions: Permission[];
}

// Tipos de estatísticas
export interface BaseStats {
  total: number;
  active: number;
  inactive: number;
  lastUpdated: Date;
}

// Tipos de notificação
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId: number;
  providerId?: number;
}