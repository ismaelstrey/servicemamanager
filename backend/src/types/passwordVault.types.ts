// Tipos do cofre de senhas

import { AuditFields, Status } from './common.types';

// Tipo principal do cofre de senhas
export interface PasswordVault extends AuditFields {
  id: number;
  providerId: number;
  name: string;
  description?: string;
  category: VaultCategory;
  url?: string;
  username: string;
  password: string; // Será criptografado
  email?: string;
  notes?: string;
  tags: string[];
  isFavorite: boolean;
  isShared: boolean;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  strength: PasswordStrength;
  customFields?: VaultCustomField[];
  attachments?: VaultAttachment[];
  sharedWith?: VaultShare[];
  accessHistory?: VaultAccessHistory[];
  provider?: any; // Será definido em provider.types.ts
}

// Categoria do cofre
export type VaultCategory = 
  | 'website'       // Site/Portal
  | 'application'   // Aplicação
  | 'database'      // Banco de dados
  | 'server'        // Servidor
  | 'network'       // Equipamento de rede
  | 'email'         // Email
  | 'social'        // Rede social
  | 'financial'     // Financeiro
  | 'cloud'         // Serviço em nuvem
  | 'vpn'           // VPN
  | 'api'           // API/Token
  | 'certificate'   // Certificado
  | 'license'       // Licença
  | 'other';        // Outros

// Força da senha
export interface PasswordStrength {
  score: number; // 0-4 (muito fraca a muito forte)
  label: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  length: number;
  entropy: number;
}

// Campos customizados
export interface VaultCustomField {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'password' | 'email' | 'url' | 'number' | 'date';
  isEncrypted: boolean;
  isRequired: boolean;
  order: number;
}

// Anexos do cofre
export interface VaultAttachment extends AuditFields {
  id: number;
  vaultId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  isEncrypted: boolean;
  description?: string;
  uploadedBy: number;
}

// Compartilhamento
export interface VaultShare extends AuditFields {
  id: number;
  vaultId: number;
  userId: number;
  permissions: VaultPermissions;
  expiresAt?: Date;
  sharedBy: number;
  acceptedAt?: Date;
  lastAccessed?: Date;
  user?: any; // Será definido em user.types.ts
}

export interface VaultPermissions {
  canView: boolean;
  canEdit: boolean;
  canShare: boolean;
  canDelete: boolean;
  canViewPassword: boolean;
  canCopyPassword: boolean;
}

// Histórico de acesso
export interface VaultAccessHistory extends AuditFields {
  id: number;
  vaultId: number;
  userId: number;
  action: VaultAction;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: Record<string, any>;
  user?: any; // Será definido em user.types.ts
}

export type VaultAction = 
  | 'view'
  | 'edit'
  | 'copy_password'
  | 'copy_username'
  | 'share'
  | 'unshare'
  | 'delete'
  | 'restore'
  | 'export'
  | 'generate_password';

// DTOs para criação de entrada no cofre
export interface CreateVaultDto {
  name: string;
  description?: string;
  category: VaultCategory;
  url?: string;
  username: string;
  password: string;
  email?: string;
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
  expiresAt?: Date;
  customFields?: Omit<VaultCustomField, 'id'>[];
  attachments?: CreateVaultAttachmentDto[];
}

export interface CreateVaultAttachmentDto {
  filename: string;
  content: string; // base64
  mimeType: string;
  description?: string;
  isEncrypted?: boolean;
}

export interface CreateVaultResponse {
  vault: Omit<PasswordVault, 'password'>;
  message: string;
}

// DTOs para atualização de entrada no cofre
export interface UpdateVaultDto {
  name?: string;
  description?: string;
  category?: VaultCategory;
  url?: string;
  username?: string;
  password?: string;
  email?: string;
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
  expiresAt?: Date;
  customFields?: VaultCustomField[];
}

export interface UpdateVaultResponse {
  vault: Omit<PasswordVault, 'password'>;
  message: string;
}

// DTOs para listagem de entradas do cofre
export interface ListVaultQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: VaultCategory | VaultCategory[];
  tags?: string[];
  isFavorite?: boolean;
  isShared?: boolean;
  isExpired?: boolean;
  expiringInDays?: number;
  weakPasswords?: boolean;
  sortBy?: keyof PasswordVault;
  sortOrder?: 'asc' | 'desc';
}

export interface VaultListItem {
  id: number;
  name: string;
  category: VaultCategory;
  url?: string;
  username: string;
  email?: string;
  tags: string[];
  isFavorite: boolean;
  isShared: boolean;
  strength: PasswordStrength;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para compartilhamento
export interface ShareVaultDto {
  userIds: number[];
  permissions: VaultPermissions;
  expiresAt?: Date;
  message?: string;
}

export interface ShareVaultResponse {
  shares: VaultShare[];
  message: string;
}

export interface UpdateShareDto {
  permissions?: VaultPermissions;
  expiresAt?: Date;
}

// DTOs para geração de senha
export interface GeneratePasswordDto {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilar?: boolean;
  excludeAmbiguous?: boolean;
  customCharacters?: string;
  pattern?: string;
}

export interface GeneratePasswordResponse {
  password: string;
  strength: PasswordStrength;
}

// DTOs para análise de segurança
export interface SecurityAnalysisResponse {
  totalPasswords: number;
  weakPasswords: number;
  duplicatePasswords: number;
  expiredPasswords: number;
  expiringSoon: number; // próximos 30 dias
  unusedPasswords: number; // não usadas em 90 dias
  sharedPasswords: number;
  averageStrength: number;
  recommendations: SecurityRecommendation[];
  strengthDistribution: Record<string, number>;
}

export interface SecurityRecommendation {
  type: 'weak_password' | 'duplicate_password' | 'expired_password' | 'unused_password';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  vaultIds: number[];
  actionRequired: string;
}

// Tipos de backup e restore
export interface VaultBackup extends AuditFields {
  id: string;
  providerId: number;
  name: string;
  description?: string;
  type: 'manual' | 'automatic';
  format: 'json' | 'csv' | 'encrypted';
  size: number;
  itemsCount: number;
  path: string;
  checksum: string;
  isEncrypted: boolean;
  createdBy: number;
  expiresAt?: Date;
}

export interface CreateBackupDto {
  name: string;
  description?: string;
  format?: 'json' | 'csv' | 'encrypted';
  includeAttachments?: boolean;
  password?: string; // Para backup criptografado
}

export interface RestoreBackupDto {
  backupId: string;
  password?: string;
  overwriteExisting?: boolean;
  importSharedItems?: boolean;
}

// Tipos de importação/exportação
export interface ImportVaultDto {
  format: 'csv' | 'json' | 'lastpass' | 'bitwarden' | 'keepass' | '1password';
  data: string; // base64 ou JSON string
  password?: string;
  overwriteExisting?: boolean;
  defaultCategory?: VaultCategory;
}

export interface ImportVaultResponse {
  imported: number;
  skipped: number;
  errors: ImportError[];
  summary: ImportSummary;
}

export interface ImportError {
  row: number;
  field: string;
  error: string;
  data: Record<string, any>;
}

export interface ImportSummary {
  totalItems: number;
  successfulImports: number;
  duplicatesSkipped: number;
  errorsCount: number;
  categoriesCreated: string[];
  tagsCreated: string[];
}

export interface ExportVaultDto {
  format: 'csv' | 'json' | 'encrypted';
  includePasswords?: boolean;
  includeAttachments?: boolean;
  categories?: VaultCategory[];
  tags?: string[];
  password?: string; // Para export criptografado
}

// Tipos de configuração do cofre
export interface VaultSettings {
  passwordPolicy: VaultPasswordPolicy;
  securitySettings: VaultSecuritySettings;
  sharingSettings: VaultSharingSettings;
  backupSettings: VaultBackupSettings;
  notificationSettings: VaultNotificationSettings;
}

export interface VaultPasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  preventCommonPasswords: boolean;
  preventPersonalInfo: boolean;
  maxAge: number; // em dias
  historyCount: number; // não reutilizar últimas N senhas
}

export interface VaultSecuritySettings {
  requireMasterPassword: boolean;
  masterPasswordTimeout: number; // em minutos
  enableTwoFactor: boolean;
  allowPasswordExport: boolean;
  logAllAccess: boolean;
  encryptAttachments: boolean;
  autoLockTimeout: number; // em minutos
}

export interface VaultSharingSettings {
  allowSharing: boolean;
  requireApproval: boolean;
  maxShareDuration: number; // em dias
  allowExternalSharing: boolean;
  defaultPermissions: VaultPermissions;
}

export interface VaultBackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  encryptBackups: boolean;
  includeAttachments: boolean;
}

export interface VaultNotificationSettings {
  expiredPasswords: boolean;
  expiringSoon: boolean; // dias antes do vencimento
  weakPasswords: boolean;
  duplicatePasswords: boolean;
  unusedPasswords: boolean; // dias sem uso
  securityAlerts: boolean;
  shareNotifications: boolean;
}

// Tipos de estatísticas do cofre
export interface VaultStats {
  totalItems: number;
  itemsByCategory: Record<VaultCategory, number>;
  favoriteItems: number;
  sharedItems: number;
  expiredItems: number;
  expiringSoon: number;
  weakPasswords: number;
  duplicatePasswords: number;
  unusedItems: number;
  averageStrength: number;
  totalAttachments: number;
  storageUsed: number; // em bytes
  accessesToday: number;
  accessesThisWeek: number;
  accessesThisMonth: number;
  mostUsedItems: {
    id: number;
    name: string;
    usageCount: number;
  }[];
  recentlyAdded: {
    id: number;
    name: string;
    createdAt: Date;
  }[];
}

// Tipos de auditoria
export interface VaultAuditLog extends AuditFields {
  id: number;
  providerId: number;
  userId: number;
  vaultId?: number;
  action: VaultAction;
  resource: string;
  resourceId?: number;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}