"use strict";
// Validadores Zod para operações de Tickets
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateSchema = exports.updateTicketStatusSchema = exports.ticketIdParamSchema = exports.providerIdParamSchema = exports.historyQuerySchema = exports.listTicketsSchema = exports.updateTicketSchema = exports.createTicketSchema = exports.ticketSourceSchema = exports.ticketCategorySchema = exports.ticketPrioritySchema = exports.ticketStatusSchema = void 0;
const zod_1 = require("zod");
const providerValidator_1 = require("./providerValidator");
Object.defineProperty(exports, "validateSchema", { enumerable: true, get: function () { return providerValidator_1.validateSchema; } });
Object.defineProperty(exports, "validateParams", { enumerable: true, get: function () { return providerValidator_1.validateParams; } });
Object.defineProperty(exports, "validateQuery", { enumerable: true, get: function () { return providerValidator_1.validateQuery; } });
// Enums canônicos para tickets (alinhados ao schema do Prisma)
exports.ticketStatusSchema = zod_1.z.enum(['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled'], {
    errorMap: () => ({ message: 'Status deve ser open, assigned, in_progress, pending, resolved, closed ou cancelled' })
});
exports.ticketPrioritySchema = zod_1.z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Prioridade deve ser low, medium, high ou urgent' })
});
exports.ticketCategorySchema = zod_1.z.enum(['technical', 'billing', 'commercial', 'installation', 'maintenance', 'complaint', 'request', 'incident', 'change', 'other'], {
    errorMap: () => ({ message: 'Categoria deve ser technical, billing, commercial, installation, maintenance, complaint, request, incident, change ou other' })
});
exports.ticketSourceSchema = zod_1.z.enum(['manual', 'email', 'phone', 'chat', 'portal', 'api', 'zabbix', 'mobile', 'social', 'other'], {
    errorMap: () => ({ message: 'Fonte deve ser manual, email, phone, chat, portal, api, zabbix, mobile, social ou other' })
});
// Validador para email
const emailSchema = zod_1.z.string()
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .trim()
    .toLowerCase();
// Validador para telefone (formato brasileiro)
const phoneSchema = zod_1.z.string()
    .regex(/^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/, 'Telefone deve estar no formato válido brasileiro')
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .trim();
// Schema para criação de ticket
exports.createTicketSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(3, 'Título deve ter pelo menos 3 caracteres')
        .max(255, 'Título deve ter no máximo 255 caracteres')
        .trim(),
    description: zod_1.z.string()
        .min(3, 'Descrição deve ter pelo menos 3 caracteres')
        .max(5000, 'Descrição deve ter no máximo 5000 caracteres')
        .trim(),
    status: exports.ticketStatusSchema.optional().default('open'),
    priority: exports.ticketPrioritySchema.optional().default('medium'),
    source: exports.ticketSourceSchema.optional().default('manual')
});
// Schema para atualização de ticket
exports.updateTicketSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(3, 'Título deve ter pelo menos 3 caracteres')
        .max(255, 'Título deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    description: zod_1.z.string()
        .min(3, 'Descrição deve ter pelo menos 3 caracteres')
        .max(5000, 'Descrição deve ter no máximo 5000 caracteres')
        .trim()
        .optional(),
    status: exports.ticketStatusSchema.optional(),
    priority: exports.ticketPrioritySchema.optional(),
    source: exports.ticketSourceSchema.optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
});
// Schema para listagem de tickets
exports.listTicketsSchema = zod_1.z.object({
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
    status: exports.ticketStatusSchema.optional(),
    priority: exports.ticketPrioritySchema.optional(),
    startDate: zod_1.z.string()
        .refine(v => !isNaN(Date.parse(v)), 'startDate deve ser uma data válida')
        .optional(),
    endDate: zod_1.z.string()
        .refine(v => !isNaN(Date.parse(v)), 'endDate deve ser uma data válida')
        .optional()
});
// Schema de paginação para histórico
exports.historyQuerySchema = zod_1.z.object({
    page: zod_1.z.string()
        .regex(/^\d+$/, 'Página deve ser um número')
        .transform(Number)
        .refine(n => n > 0, 'Página deve ser maior que 0')
        .optional(),
    limit: zod_1.z.string()
        .regex(/^\d+$/, 'Limite deve ser um número')
        .transform(Number)
        .refine(n => n > 0 && n <= 100, 'Limite deve ser entre 1 e 100')
        .optional()
});
// Params para rotas com providerId
exports.providerIdParamSchema = zod_1.z.object({
    providerId: zod_1.z.string()
        .regex(/^\d+$/, 'providerId deve ser um número')
        .transform(Number)
        .refine(n => n > 0, 'providerId deve ser maior que 0')
});
// Params para rotas com ticket id
exports.ticketIdParamSchema = zod_1.z.object({
    id: zod_1.z.string()
        .regex(/^\d+$/, 'id deve ser um número')
        .transform(Number)
        .refine(n => n > 0, 'id deve ser maior que 0')
});
// Schema específico para alteração de status
exports.updateTicketStatusSchema = zod_1.z.object({
    status: exports.ticketStatusSchema
});
