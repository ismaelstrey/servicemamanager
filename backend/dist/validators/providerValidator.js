"use strict";
// Validadores Zod para operações de Provider
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateSchema = exports.acceptInviteSchema = exports.inviteTokenSchema = exports.providerSettingsSchema = exports.inviteUserSchema = exports.updateStatusSchema = exports.workspaceParamSchema = exports.providerIdSchema = exports.listProvidersSchema = exports.updateProviderSchema = exports.createProviderSchema = void 0;
const zod_1 = require("zod");
// Validador para CNPJ
const cnpjSchema = zod_1.z.string()
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
const workspaceSchema = zod_1.z.string()
    .min(3, 'Workspace deve ter pelo menos 3 caracteres')
    .max(50, 'Workspace deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Workspace deve conter apenas letras minúsculas, números e hífens')
    .refine((workspace) => !workspace.startsWith('-') && !workspace.endsWith('-'), 'Workspace não pode começar ou terminar com hífen');
// Validador para CEP
const zipCodeSchema = zod_1.z.string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000 ou 00000000');
// Validador para telefone
const phoneSchema = zod_1.z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000');
// Validador para email
const emailSchema = zod_1.z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres');
// Enum para planos
const providerPlanSchema = zod_1.z.enum(['basic', 'professional', 'enterprise'], {
    errorMap: () => ({ message: 'Plano deve ser basic, professional ou enterprise' })
});
// Enum para status
const statusSchema = zod_1.z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: 'Status deve ser active ou inactive' })
});
// Enum para roles de usuário no provedor
const providerRoleSchema = zod_1.z.enum(['admin', 'manager', 'technician', 'viewer'], {
    errorMap: () => ({ message: 'Role deve ser admin, manager, technician ou viewer' })
});
/**
 * Validador para criação de provedor
 */
exports.createProviderSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim(),
    cnpj: cnpjSchema,
    email: emailSchema,
    phone: phoneSchema.optional(),
    address: zod_1.z.string()
        .min(5, 'Endereço deve ter pelo menos 5 caracteres')
        .max(500, 'Endereço deve ter no máximo 500 caracteres')
        .trim()
        .optional(),
    city: zod_1.z.string()
        .min(2, 'Cidade deve ter pelo menos 2 caracteres')
        .max(100, 'Cidade deve ter no máximo 100 caracteres')
        .trim()
        .optional(),
    state: zod_1.z.string()
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
exports.updateProviderSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    cnpj: cnpjSchema.optional(),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    address: zod_1.z.string()
        .min(5, 'Endereço deve ter pelo menos 5 caracteres')
        .max(500, 'Endereço deve ter no máximo 500 caracteres')
        .trim()
        .optional(),
    city: zod_1.z.string()
        .min(2, 'Cidade deve ter pelo menos 2 caracteres')
        .max(100, 'Cidade deve ter no máximo 100 caracteres')
        .trim()
        .optional(),
    state: zod_1.z.string()
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
exports.listProvidersSchema = zod_1.z.object({
    page: zod_1.z.string()
        .regex(/^\d+$/, 'Página deve ser um número')
        .transform(Number)
        .refine(n => n > 0, 'Página deve ser maior que 0')
        .optional(),
    limit: zod_1.z.string()
        .regex(/^\d+$/, 'Limite deve ser um número')
        .transform(Number)
        .refine(n => n > 0 && n <= 100, 'Limite deve ser entre 1 e 100')
        .optional(),
    search: zod_1.z.string()
        .min(1, 'Busca deve ter pelo menos 1 caractere')
        .max(255, 'Busca deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    status: statusSchema.optional(),
    plan: providerPlanSchema.optional(),
    sortBy: zod_1.z.enum(['name', 'cnpj', 'email', 'workspace', 'plan', 'status', 'createdAt', 'updatedAt'], {
        errorMap: () => ({ message: 'Campo de ordenação inválido' })
    }).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc'], {
        errorMap: () => ({ message: 'Ordem deve ser asc ou desc' })
    }).optional()
});
/**
 * Validador para parâmetros de ID
 */
exports.providerIdSchema = zod_1.z.object({
    id: zod_1.z.string()
        .regex(/^\d+$/, 'ID deve ser um número')
        .transform(Number)
        .refine(n => n > 0, 'ID deve ser maior que 0')
});
/**
 * Validador para workspace
 */
exports.workspaceParamSchema = zod_1.z.object({
    workspace: workspaceSchema
});
/**
 * Validador para alteração de status
 */
exports.updateStatusSchema = zod_1.z.object({
    status: statusSchema
});
/**
 * Validador para convite de usuário
 */
exports.inviteUserSchema = zod_1.z.object({
    email: emailSchema,
    role: providerRoleSchema,
    permissions: zod_1.z.array(zod_1.z.string())
        .max(50, 'Máximo de 50 permissões')
        .optional()
        .default([])
});
/**
 * Validador para configurações de ticket
 */
const ticketSettingsSchema = zod_1.z.object({
    autoAssignment: zod_1.z.boolean().optional(),
    defaultPriority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    slaEnabled: zod_1.z.boolean().optional(),
    escalationEnabled: zod_1.z.boolean().optional(),
    customerPortalEnabled: zod_1.z.boolean().optional(),
    allowCustomerClose: zod_1.z.boolean().optional(),
    requireApprovalForClose: zod_1.z.boolean().optional(),
    notifyOnStatusChange: zod_1.z.boolean().optional()
});
/**
 * Validador para configurações de notificação
 */
const notificationSettingsSchema = zod_1.z.object({
    emailEnabled: zod_1.z.boolean().optional(),
    smsEnabled: zod_1.z.boolean().optional(),
    whatsappEnabled: zod_1.z.boolean().optional(),
    pushEnabled: zod_1.z.boolean().optional(),
    ticketCreated: zod_1.z.boolean().optional(),
    ticketUpdated: zod_1.z.boolean().optional(),
    ticketClosed: zod_1.z.boolean().optional(),
    equipmentAlert: zod_1.z.boolean().optional(),
    maintenanceReminder: zod_1.z.boolean().optional(),
    billingReminder: zod_1.z.boolean().optional()
});
/**
 * Validador para política de senha
 */
const passwordPolicySchema = zod_1.z.object({
    minLength: zod_1.z.number().min(6).max(50).optional(),
    requireUppercase: zod_1.z.boolean().optional(),
    requireLowercase: zod_1.z.boolean().optional(),
    requireNumbers: zod_1.z.boolean().optional(),
    requireSpecialChars: zod_1.z.boolean().optional(),
    expirationDays: zod_1.z.number().min(0).max(365).optional()
});
/**
 * Validador para configurações de segurança
 */
const securitySettingsSchema = zod_1.z.object({
    twoFactorRequired: zod_1.z.boolean().optional(),
    passwordPolicy: passwordPolicySchema.optional(),
    sessionTimeout: zod_1.z.number().min(5).max(1440).optional(), // 5 min a 24h
    maxLoginAttempts: zod_1.z.number().min(1).max(10).optional(),
    lockoutDuration: zod_1.z.number().min(1).max(1440).optional(), // 1 min a 24h
    ipWhitelist: zod_1.z.array(zod_1.z.string().ip()).max(100).optional(),
    allowedDomains: zod_1.z.array(zod_1.z.string().max(255)).max(50).optional()
});
/**
 * Validador para configurações de integração
 */
const integrationSettingsSchema = zod_1.z.object({
    zabbixEnabled: zod_1.z.boolean().optional(),
    zabbixConfig: zod_1.z.any().optional(), // TODO: Definir schema específico do Zabbix
    webhooksEnabled: zod_1.z.boolean().optional(),
    apiEnabled: zod_1.z.boolean().optional(),
    ssoEnabled: zod_1.z.boolean().optional(),
    ldapEnabled: zod_1.z.boolean().optional()
});
/**
 * Validador para configurações de branding
 */
const brandingSettingsSchema = zod_1.z.object({
    logo: zod_1.z.string().url().optional().nullable(),
    primaryColor: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal').optional(),
    secondaryColor: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal').optional(),
    customCss: zod_1.z.string().max(10000).optional().nullable(),
    favicon: zod_1.z.string().url().optional().nullable(),
    companyName: zod_1.z.string().max(255).optional(),
    supportEmail: emailSchema.optional(),
    supportPhone: phoneSchema.optional()
});
/**
 * Validador para configurações do provedor
 */
exports.providerSettingsSchema = zod_1.z.object({
    ticket: ticketSettingsSchema.optional(),
    notification: notificationSettingsSchema.optional(),
    security: securitySettingsSchema.optional(),
    integration: integrationSettingsSchema.optional(),
    branding: brandingSettingsSchema.optional()
});
/**
 * Validador para token de convite
 */
exports.inviteTokenSchema = zod_1.z.object({
    token: zod_1.z.string()
        .uuid('Token deve ser um UUID válido')
});
/**
 * Validador para aceitação de convite
 */
exports.acceptInviteSchema = zod_1.z.object({
    token: zod_1.z.string()
        .uuid('Token deve ser um UUID válido'),
    password: zod_1.z.string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .max(255, 'Senha deve ter no máximo 255 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
});
/**
 * Middleware para validação de schemas
 */
const validateSchema = (schema) => {
    return (req, res, next) => {
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
        }
        catch (error) {
            console.error('Erro na validação:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno na validação',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    };
};
exports.validateSchema = validateSchema;
/**
 * Middleware para validação de parâmetros
 */
const validateParams = (schema) => {
    return (req, res, next) => {
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
        }
        catch (error) {
            console.error('Erro na validação de parâmetros:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno na validação',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    };
};
exports.validateParams = validateParams;
/**
 * Middleware para validação de query parameters
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.query);
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
        }
        catch (error) {
            console.error('Erro na validação de query:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno na validação',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    };
};
exports.validateQuery = validateQuery;
