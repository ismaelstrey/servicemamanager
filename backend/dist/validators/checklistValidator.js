"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateSchema = exports.updateChecklistItemSchema = exports.linkIdParamSchema = exports.createChecklistLinkSchema = exports.templateIdParamSchema = exports.updateChecklistTemplateSchema = exports.createChecklistTemplateSchema = exports.checklistTemplateItemSchema = void 0;
const zod_1 = require("zod");
const providerValidator_1 = require("./providerValidator");
Object.defineProperty(exports, "validateSchema", { enumerable: true, get: function () { return providerValidator_1.validateSchema; } });
Object.defineProperty(exports, "validateParams", { enumerable: true, get: function () { return providerValidator_1.validateParams; } });
Object.defineProperty(exports, "validateQuery", { enumerable: true, get: function () { return providerValidator_1.validateQuery; } });
exports.checklistTemplateItemSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().max(1000).optional(),
    required: zod_1.z.boolean().optional().default(false),
    order: zod_1.z.number().int().min(0).optional().default(0)
});
exports.createChecklistTemplateSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(255),
    description: zod_1.z.string().max(1000).optional(),
    type: zod_1.z.enum(['standard', 'routine']).optional().default('standard'),
    providerId: zod_1.z.coerce.number().int().min(1),
    items: zod_1.z.array(exports.checklistTemplateItemSchema).min(1)
});
exports.updateChecklistTemplateSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(255).optional(),
    description: zod_1.z.string().max(1000).optional(),
    type: zod_1.z.enum(['standard', 'routine']).optional(),
    items: zod_1.z.array(exports.checklistTemplateItemSchema).min(1).optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Forneça campos para atualizar' });
exports.templateIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0)
});
exports.createChecklistLinkSchema = zod_1.z.object({
    checklistTemplateId: zod_1.z.coerce.number().int().min(1),
    resourceType: zod_1.z.enum(['TICKET', 'SERVICE_ORDER']),
    resourceId: zod_1.z.coerce.number().int().min(1)
});
exports.linkIdParamSchema = zod_1.z.object({
    linkId: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0)
});
exports.updateChecklistItemSchema = zod_1.z.object({
    done: zod_1.z.boolean().optional(),
    note: zod_1.z.string().max(1000).optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Forneça campos para atualizar' });
