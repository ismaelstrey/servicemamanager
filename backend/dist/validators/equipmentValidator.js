"use strict";
// Validadores Zod para operações de Equipamentos
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateSchema = exports.equipmentIdParamSchema = exports.providerIdParamSchema = exports.historyQuerySchema = exports.listEquipmentsSchema = exports.updateEquipmentSchema = exports.createEquipmentSchema = exports.equipmentStatusSchema = exports.equipmentTypeSchema = void 0;
const zod_1 = require("zod");
const providerValidator_1 = require("./providerValidator");
Object.defineProperty(exports, "validateSchema", { enumerable: true, get: function () { return providerValidator_1.validateSchema; } });
Object.defineProperty(exports, "validateParams", { enumerable: true, get: function () { return providerValidator_1.validateParams; } });
Object.defineProperty(exports, "validateQuery", { enumerable: true, get: function () { return providerValidator_1.validateQuery; } });
// Tipos válidos de equipamentos (enum canônico)
exports.equipmentTypeSchema = zod_1.z.enum(['switch', 'olt', 'router', 'server', 'virtualizer', 'other'], {
    errorMap: () => ({ message: 'Tipo deve ser switch, olt, router, server, virtualizer ou other' })
});
// Enum para status de equipamento
exports.equipmentStatusSchema = zod_1.z.enum(['active', 'inactive', 'maintenance'], {
    errorMap: () => ({ message: 'Status deve ser active, inactive ou maintenance' })
});
// Schema para criação de equipamento
exports.createEquipmentSchema = zod_1.z.object({
    label: zod_1.z.string()
        .min(2, 'Label deve ter pelo menos 2 caracteres')
        .max(255, 'Label deve ter no máximo 255 caracteres')
        .trim(),
    type: exports.equipmentTypeSchema,
    serial: zod_1.z.string()
        .min(3, 'Serial deve ter pelo menos 3 caracteres')
        .max(255, 'Serial deve ter no máximo 255 caracteres')
        .trim(),
    status: exports.equipmentStatusSchema.optional().default('active')
});
// Schema para atualização de equipamento
exports.updateEquipmentSchema = zod_1.z.object({
    label: zod_1.z.string()
        .min(2, 'Label deve ter pelo menos 2 caracteres')
        .max(255, 'Label deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    type: exports.equipmentTypeSchema.optional(),
    serial: zod_1.z.string()
        .min(3, 'Serial deve ter pelo menos 3 caracteres')
        .max(255, 'Serial deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    status: exports.equipmentStatusSchema.optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
});
// Schema para listagem de equipamentos
exports.listEquipmentsSchema = zod_1.z.object({
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
    type: exports.equipmentTypeSchema.optional(),
    status: exports.equipmentStatusSchema.optional()
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
// Params para rotas com equipment id
exports.equipmentIdParamSchema = zod_1.z.object({
    id: zod_1.z.string()
        .regex(/^\d+$/, 'id deve ser um número')
        .transform(Number)
        .refine(n => n > 0, 'id deve ser maior que 0')
});
