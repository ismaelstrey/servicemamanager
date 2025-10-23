"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateSchema = exports.serviceOrderIdParamSchema = exports.serviceOrderStatsSchema = exports.listServiceOrdersSchema = exports.updateServiceOrderStatusSchema = exports.updateServiceOrderSchema = exports.createServiceOrderSchema = exports.serviceOrderPrioritySchema = exports.serviceOrderStatusSchema = void 0;
const zod_1 = require("zod");
const providerValidator_1 = require("./providerValidator");
Object.defineProperty(exports, "validateSchema", { enumerable: true, get: function () { return providerValidator_1.validateSchema; } });
Object.defineProperty(exports, "validateParams", { enumerable: true, get: function () { return providerValidator_1.validateParams; } });
Object.defineProperty(exports, "validateQuery", { enumerable: true, get: function () { return providerValidator_1.validateQuery; } });
const client_1 = require("@prisma/client");
// Enums for service orders
exports.serviceOrderStatusSchema = zod_1.z.nativeEnum(client_1.ServiceOrderStatus, {
    errorMap: () => ({ message: 'Status inválido' })
});
exports.serviceOrderPrioritySchema = zod_1.z.nativeEnum(client_1.ServiceOrderPriority, {
    errorMap: () => ({ message: 'Prioridade inválida' })
});
// Schema for creating service order
exports.createServiceOrderSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(3, 'Título deve ter entre 3 e 255 caracteres')
        .max(255, 'Título deve ter entre 3 e 255 caracteres')
        .trim(),
    description: zod_1.z.string()
        .min(10, 'Descrição deve ter entre 10 e 2000 caracteres')
        .max(2000, 'Descrição deve ter entre 10 e 2000 caracteres')
        .trim(),
    status: exports.serviceOrderStatusSchema.optional(),
    priority: exports.serviceOrderPrioritySchema.optional(),
    scheduledDate: zod_1.z.string().datetime('Data agendada deve estar no formato ISO8601').optional()
        .refine((value) => {
        if (value) {
            const date = new Date(value);
            const now = new Date();
            return date >= now;
        }
        return true;
    }, { message: 'Data agendada não pode ser no passado' }),
    estimatedHours: zod_1.z.number().min(0.1, 'Horas estimadas devem ser um número entre 0.1 e 1000').max(1000, 'Horas estimadas devem ser um número entre 0.1 e 1000').optional(),
    cost: zod_1.z.number().min(0, 'Custo deve ser um número positivo').optional(),
    notes: zod_1.z.string().max(2000, 'Notas não podem exceder 2000 caracteres').optional(),
    providerId: zod_1.z.number().int().min(1, 'ID do provedor deve ser um número inteiro positivo'),
    ticketId: zod_1.z.number().int().min(1, 'ID do ticket deve ser um número inteiro positivo').optional()
});
// Schema for updating service order
exports.updateServiceOrderSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(3, 'Título deve ter entre 3 e 255 caracteres')
        .max(255, 'Título deve ter entre 3 e 255 caracteres')
        .trim()
        .optional(),
    description: zod_1.z.string()
        .min(10, 'Descrição deve ter entre 10 e 2000 caracteres')
        .max(2000, 'Descrição deve ter entre 10 e 2000 caracteres')
        .trim()
        .optional(),
    status: exports.serviceOrderStatusSchema.optional(),
    priority: exports.serviceOrderPrioritySchema.optional(),
    scheduledDate: zod_1.z.string().datetime('Data agendada deve estar no formato ISO8601').optional(),
    startedAt: zod_1.z.string().datetime('Data de início deve estar no formato ISO8601').optional(),
    completedAt: zod_1.z.string().datetime('Data de conclusão deve estar no formato ISO8601').optional(),
    estimatedHours: zod_1.z.number().min(0.1, 'Horas estimadas devem ser um número entre 0.1 e 1000').max(1000, 'Horas estimadas devem ser um número entre 0.1 e 1000').optional(),
    actualHours: zod_1.z.number().min(0.1, 'Horas reais devem ser um número entre 0.1 e 1000').max(1000, 'Horas reais devem ser um número entre 0.1 e 1000').optional(),
    cost: zod_1.z.number().min(0, 'Custo deve ser um número positivo').optional(),
    notes: zod_1.z.string().max(2000, 'Notas não podem exceder 2000 caracteres').optional(),
    ticketId: zod_1.z.number().int().min(1, 'ID do ticket deve ser um número inteiro positivo').optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: 'Ao menos um campo deve ser fornecido para atualização'
});
// Schema for updating service order status
exports.updateServiceOrderStatusSchema = zod_1.z.object({
    status: exports.serviceOrderStatusSchema
});
// Schema for listing service orders
exports.listServiceOrdersSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    status: exports.serviceOrderStatusSchema.optional(),
    priority: exports.serviceOrderPrioritySchema.optional(),
    providerId: zod_1.z.coerce.number().int().min(1).optional()
});
// Schema for service order stats
exports.serviceOrderStatsSchema = zod_1.z.object({
    providerId: zod_1.z.coerce.number().int().min(1).optional()
});
// Params for routes with service order id
exports.serviceOrderIdParamSchema = zod_1.z.object({
    id: zod_1.z.string()
        .regex(/^\d+$/, 'ID deve ser um número inteiro positivo')
        .transform(Number)
        .refine(n => n > 0, 'ID deve ser um número inteiro positivo')
});
