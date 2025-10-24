"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateSchema = exports.notificationIdParamSchema = exports.providerIdParamSchema = exports.listNotificationsSchema = void 0;
const zod_1 = require("zod");
const providerValidator_1 = require("./providerValidator");
Object.defineProperty(exports, "validateSchema", { enumerable: true, get: function () { return providerValidator_1.validateSchema; } });
Object.defineProperty(exports, "validateParams", { enumerable: true, get: function () { return providerValidator_1.validateParams; } });
Object.defineProperty(exports, "validateQuery", { enumerable: true, get: function () { return providerValidator_1.validateQuery; } });
// Schema para listagem de notificações
exports.listNotificationsSchema = zod_1.z.object({
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
    unread: zod_1.z.union([
        zod_1.z.string().regex(/^(true|false)$/i, 'unread deve ser true ou false').transform(v => v.toLowerCase() === 'true'),
        zod_1.z.boolean()
    ]).optional()
});
// Params para rotas com providerId
exports.providerIdParamSchema = zod_1.z.object({
    providerId: zod_1.z.string()
        .regex(/^\d+$/, 'providerId deve ser um número')
        .transform(Number)
        .refine(n => n > 0, 'providerId deve ser maior que 0')
});
// Params para rotas com notification id
exports.notificationIdParamSchema = zod_1.z.object({
    id: zod_1.z.string()
        .regex(/^\d+$/, 'id deve ser um número')
        .transform(Number)
        .refine(n => n > 0, 'id deve ser maior que 0')
});
