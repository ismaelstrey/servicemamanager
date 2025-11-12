// Validadores Zod para operações de Provider

import { z } from 'zod';

// Validador para CNPJ
const cnpjSchema = z.string()
  .min(14, 'CNPJ deve ter 14 dígitos')
  .max(18, 'CNPJ inválido')
  .refine((cnpj) => {
    // Remove caracteres não numéricos
    const cleanCnpj = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cleanCnpj.length !== 14) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCnpj)) {
      return false;
    }

    // Validação dos dígitos verificadores
    let sum = 0;
    let weight = 5;
    
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCnpj[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    if (parseInt(cleanCnpj[12]) !== digit1) {
      return false;
    }
    
    sum = 0;
    weight = 6;
    
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCnpj[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return parseInt(cleanCnpj[13]) === digit2;
  }, 'CNPJ inválido');

// Validador para workspace
const workspaceSchema = z.string()
  .min(3, 'Workspace deve ter pelo menos 3 caracteres')
  .max(50, 'Workspace deve ter no máximo 50 caracteres')
  .regex(/^[a-z0-9-]+$/, 'Workspace deve conter apenas letras minúsculas, números e hífens')
  .refine((workspace) => !workspace.startsWith('-') && !workspace.endsWith('-'), 
    'Workspace não pode começar ou terminar com hífen');

// Validador para CEP
const zipCodeSchema = z.string()
  .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000 ou 00000000');

// Validador para telefone
const phoneSchema = z.string()
  .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000');

// Validador para email
const emailSchema = z.string()
  .email('Email inválido')
  .max(255, 'Email deve ter no máximo 255 caracteres');

// Enum para planos
const providerPlanSchema = z.enum(['basic', 'professional', 'enterprise'], {
  errorMap: () => ({ message: 'Plano deve ser basic, professional ou enterprise' })
});

// Enum para status
const statusSchema = z.enum(['active', 'inactive'], {
  errorMap: () => ({ message: 'Status deve ser active ou inactive' })
});

// Enum para roles de usuário no provedor
const providerRoleSchema = z.enum(['admin', 'manager', 'technician', 'viewer'], {
  errorMap: () => ({ message: 'Role deve ser admin, manager, technician ou viewer' })
});

/**
 * Validador para criação de provedor
 */
export const createProviderSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  
  cnpj: cnpjSchema,
  
  email: emailSchema,
  
  phone: phoneSchema.optional(),
  
  address: z.string()
    .min(5, 'Endereço deve ter pelo menos 5 caracteres')
    .max(500, 'Endereço deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
  
  city: z.string()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  
  state: z.string()
    .length(2, 'Estado deve ter 2 caracteres (UF)')
    .regex(/^[A-Z]{2}$/, 'Estado deve ser uma UF válida (ex: SP, RJ)')
    .optional(),
  
  zipCode: zipCodeSchema.optional(),
  
  workspace: workspaceSchema.optional(),
  
  plan: providerPlanSchema.optional().default('basic')
});

/**
 * Validador para atualização de provedor
 */
export const updateProviderSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  
  cnpj: cnpjSchema.optional(),
  
  email: emailSchema.optional(),
  
  phone: phoneSchema.optional(),
  
  address: z.string()
    .min(5, 'Endereço deve ter pelo menos 5 caracteres')
    .max(500, 'Endereço deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
  
  city: z.string()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  
  state: z.string()
    .length(2, 'Estado deve ter 2 caracteres (UF)')
    .regex(/^[A-Z]{2}$/, 'Estado deve ser uma UF válida (ex: SP, RJ)')
    .optional(),
  
  zipCode: zipCodeSchema.optional(),
  
  workspace: workspaceSchema.optional(),
  
  plan: providerPlanSchema.optional()
});

/**
 * Validador para listagem de provedores
 */
export const listProvidersSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Página deve ser um número')
    .transform(Number)
    .refine(n => n > 0, 'Página deve ser maior que 0')
    .optional(),
  
  limit: z.string()
    .regex(/^\d+$/, 'Limite deve ser um número')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limite deve ser entre 1 e 100')
    .optional(),
  
  search: z.string()
    .min(1, 'Busca deve ter pelo menos 1 caractere')
    .max(255, 'Busca deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  
  status: statusSchema.optional(),
  
  plan: providerPlanSchema.optional(),
  
  sortBy: z.enum(['name', 'cnpj', 'email', 'workspace', 'plan', 'status', 'createdAt', 'updatedAt'], {
    errorMap: () => ({ message: 'Campo de ordenação inválido' })
  }).optional(),
  
  sortOrder: z.enum(['asc', 'desc'], {
    errorMap: () => ({ message: 'Ordem deve ser asc ou desc' })
  }).optional()
});

/**
 * Validador para parâmetros de ID
 */
export const providerIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID deve ser um número')
    .transform(Number)
    .refine(n => n > 0, 'ID deve ser maior que 0')
});

/**
 * Validador para workspace
 */
export const workspaceParamSchema = z.object({
  workspace: workspaceSchema
});

/**
 * Validador para alteração de status
 */
export const updateStatusSchema = z.object({
  status: statusSchema
});

/**
 * Validador para convite de usuário
 */
export const inviteUserSchema = z.object({
  email: emailSchema,
  
  role: providerRoleSchema,
  
  permissions: z.array(z.string())
    .max(50, 'Máximo de 50 permissões')
    .optional()
    .default([])
});

/**
 * Validador para configurações de ticket
 */
const ticketSettingsSchema = z.object({
  autoAssignment: z.boolean().optional(),
  defaultPriority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  slaEnabled: z.boolean().optional(),
  escalationEnabled: z.boolean().optional(),
  customerPortalEnabled: z.boolean().optional(),
  allowCustomerClose: z.boolean().optional(),
  requireApprovalForClose: z.boolean().optional(),
  notifyOnStatusChange: z.boolean().optional()
});

/**
 * Validador para configurações de notificação
 */
const notificationSettingsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  ticketCreated: z.boolean().optional(),
  ticketUpdated: z.boolean().optional(),
  ticketClosed: z.boolean().optional(),
  equipmentAlert: z.boolean().optional(),
  maintenanceReminder: z.boolean().optional(),
  billingReminder: z.boolean().optional()
});

/**
 * Validador para política de senha
 */
const passwordPolicySchema = z.object({
  minLength: z.number().min(6).max(50).optional(),
  requireUppercase: z.boolean().optional(),
  requireLowercase: z.boolean().optional(),
  requireNumbers: z.boolean().optional(),
  requireSpecialChars: z.boolean().optional(),
  expirationDays: z.number().min(0).max(365).optional()
});

/**
 * Validador para configurações de segurança
 */
const securitySettingsSchema = z.object({
  twoFactorRequired: z.boolean().optional(),
  passwordPolicy: passwordPolicySchema.optional(),
  sessionTimeout: z.number().min(5).max(1440).optional(), // 5 min a 24h
  maxLoginAttempts: z.number().min(1).max(10).optional(),
  lockoutDuration: z.number().min(1).max(1440).optional(), // 1 min a 24h
  ipWhitelist: z.array(z.string().ip()).max(100).optional(),
  allowedDomains: z.array(z.string().max(255)).max(50).optional()
});

/**
 * Validador para configurações de integração
 */
const integrationSettingsSchema = z.object({
  zabbixEnabled: z.boolean().optional(),
  zabbixConfig: z.any().optional(), // TODO: Definir schema específico do Zabbix
  webhooksEnabled: z.boolean().optional(),
  apiEnabled: z.boolean().optional(),
  ssoEnabled: z.boolean().optional(),
  ldapEnabled: z.boolean().optional()
});

/**
 * Validador para configurações de branding
 */
const brandingSettingsSchema = z.object({
  logo: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal').optional(),
  customCss: z.string().max(10000).optional().nullable(),
  favicon: z.string().url().optional().nullable(),
  companyName: z.string().max(255).optional(),
  supportEmail: emailSchema.optional(),
  supportPhone: phoneSchema.optional()
});

/**
 * Validador para configurações do provedor
 */
export const providerSettingsSchema = z.object({
  ticket: ticketSettingsSchema.optional(),
  notification: notificationSettingsSchema.optional(),
  security: securitySettingsSchema.optional(),
  integration: integrationSettingsSchema.optional(),
  branding: brandingSettingsSchema.optional()
});

/**
 * Validador para token de convite
 */
export const inviteTokenSchema = z.object({
  token: z.string()
    .uuid('Token deve ser um UUID válido')
});

/**
 * Validador para aceitação de convite
 */
export const acceptInviteSchema = z.object({
  token: z.string()
    .uuid('Token deve ser um UUID válido'),
  
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(255, 'Senha deve ter no máximo 255 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
});

// Tipos inferidos dos schemas
export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type ListProvidersInput = z.infer<typeof listProvidersSchema>;
export type ProviderIdInput = z.infer<typeof providerIdSchema>;
export type WorkspaceParamInput = z.infer<typeof workspaceParamSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type ProviderSettingsInput = z.infer<typeof providerSettingsSchema>;
export type InviteTokenInput = z.infer<typeof inviteTokenSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

/**
 * Middleware para validação de schemas
 */
export const validateSchema = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      
      req.body = result.data;
      next();
    } catch (error) {
      console.error('Erro na validação:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno na validação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };
};

/**
 * Middleware para validação de parâmetros
 */
export const validateParams = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      
      req.params = result.data;
      next();
    } catch (error) {
      console.error('Erro na validação de parâmetros:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno na validação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };
};

/**
 * Middleware para validação de query parameters
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      // Log de debug: ajuda a identificar o formato real de req.query e o tipo de providerId
      // Comentário: estes logs são temporários para diagnosticar o erro de providerId na validação
      console.log('[validateQuery] raw query =', req.query, 'providerId =', req.query?.providerId, 'typeof =', typeof req.query?.providerId);

      // Normalização defensiva: converte strings numéricas em números para chaves conhecidas
      // Isso previne 400 por "Expected number, received string" mesmo em ambientes onde o parser de query se comporta de forma diferente
      // Conversão apenas para chaves que nossos schemas tratam como número via z.coerce
      // Evita interferir em schemas que esperam strings e fazem transform(Number),
      // como listTicketsSchema (page/limit como string)
      const numericKeys = new Set(['providerId', 'assigneeId', 'customerId']);
      const sanitized: Record<string, any> = { ...req.query };
      for (const key of Object.keys(sanitized)) {
        if (!numericKeys.has(key)) continue;
        const val = sanitized[key];
        if (typeof val === 'string') {
          const trimmed = val.trim();
          if (/^\d+$/.test(trimmed)) sanitized[key] = parseInt(trimmed, 10);
        } else if (Array.isArray(val)) {
          // Se veio como array (ex.: providerId[]=2), usa o primeiro elemento válido
          for (const item of val) {
            const trimmed = String(item).trim();
            if (/^\d+$/.test(trimmed)) { sanitized[key] = parseInt(trimmed, 10); break; }
          }
        }
      }

      const result = schema.safeParse(sanitized);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      
      req.query = result.data;
      next();
    } catch (error) {
      console.error('Erro na validação de query:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno na validação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };
};