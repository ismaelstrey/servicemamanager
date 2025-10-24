"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientUpdateServiceOrderSchema = exports.clientUpdateProfileSchema = exports.clientQualificationSchema = exports.clientCommentSchema = exports.clientListServiceOrdersSchema = exports.clientCreateServiceOrderSchema = void 0;
const zod_1 = require("zod");
exports.clientCreateServiceOrderSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(255).trim(),
    description: zod_1.z.string().min(10).max(2000).trim(),
    scheduledDate: zod_1.z.string().datetime().optional(),
    estimatedHours: zod_1.z.number().min(0.1).max(1000).optional(),
    notes: zod_1.z.string().max(2000).optional()
});
exports.clientListServiceOrdersSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    status: zod_1.z.string().optional()
});
exports.clientCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(5000),
});
exports.clientQualificationSchema = zod_1.z.object({
    rating: zod_1.z.coerce.number().int().min(1).max(5),
    feedback: zod_1.z.string().min(1).max(2000).optional()
});
exports.clientUpdateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome muito curto').max(255).trim().optional(),
    phone: zod_1.z
        .string()
        .regex(/^\d{10,11}$/i, 'Telefone deve conter 10 ou 11 dígitos numéricos')
        .optional(),
    document: zod_1.z.string().min(11, 'Documento muito curto').max(18).optional(),
})
    .superRefine((data, ctx) => {
    if (data.name === undefined &&
        data.phone === undefined &&
        data.document === undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Informe pelo menos um campo para atualizar',
            path: ['_'],
        });
    }
});
exports.clientUpdateServiceOrderSchema = zod_1.z.object({
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
    notes: zod_1.z.string().max(2000, 'Notas não podem exceder 2000 caracteres').optional()
}).superRefine((data, ctx) => {
    if (data.title === undefined &&
        data.description === undefined &&
        data.scheduledDate === undefined &&
        data.estimatedHours === undefined &&
        data.notes === undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Informe ao menos um campo para atualizar',
            path: ['_'],
        });
    }
});
