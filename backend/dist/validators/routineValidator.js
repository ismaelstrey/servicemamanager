"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateSchema = exports.listRoutinesSchema = exports.routineIdParamSchema = exports.updateRoutineSchema = exports.createRoutineSchema = exports.daysOfWeekSchema = void 0;
const zod_1 = require("zod");
const providerValidator_1 = require("./providerValidator");
Object.defineProperty(exports, "validateSchema", { enumerable: true, get: function () { return providerValidator_1.validateSchema; } });
Object.defineProperty(exports, "validateParams", { enumerable: true, get: function () { return providerValidator_1.validateParams; } });
Object.defineProperty(exports, "validateQuery", { enumerable: true, get: function () { return providerValidator_1.validateQuery; } });
exports.daysOfWeekSchema = zod_1.z.object({
    mon: zod_1.z.boolean(),
    tue: zod_1.z.boolean(),
    wed: zod_1.z.boolean(),
    thu: zod_1.z.boolean(),
    fri: zod_1.z.boolean(),
    sat: zod_1.z.boolean(),
    sun: zod_1.z.boolean()
}).refine(d => Object.values(d).some(Boolean), { message: 'Ao menos um dia deve estar ativo' });
exports.createRoutineSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(255),
    enabled: zod_1.z.boolean().optional().default(true),
    providerId: zod_1.z.coerce.number().int().min(1),
    targetType: zod_1.z.enum(['ALL_CUSTOMERS', 'CUSTOMER_IDS', 'CUSTOMER_GROUP']),
    targetIds: zod_1.z.array(zod_1.z.coerce.number().int().min(1)).optional(),
    daysOfWeek: exports.daysOfWeekSchema,
    time: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
    timezone: zod_1.z.string().optional(),
    createFor: zod_1.z.enum(['TICKET', 'SERVICE_ORDER']).default('TICKET'),
    templateId: zod_1.z.coerce.number().int().min(1).optional(),
    defaultCategory: zod_1.z.string().optional(),
    defaultPriority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    defaultSource: zod_1.z.enum(['manual', 'email', 'phone', 'chat', 'portal', 'api', 'zabbix', 'mobile', 'social', 'other']).optional()
});
exports.updateRoutineSchema = exports.createRoutineSchema.partial().refine(data => Object.keys(data).length > 0, { message: 'Forneça campos para atualizar' });
exports.routineIdParamSchema = zod_1.z.object({ id: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0) });
exports.listRoutinesSchema = zod_1.z.object({
    providerId: zod_1.z.coerce.number().int().min(1).optional(),
    enabled: zod_1.z.union([zod_1.z.string().regex(/^(true|false)$/i).transform(v => v.toLowerCase() === 'true'), zod_1.z.boolean()]).optional()
});
