"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateSchema = exports.setCredentialGroupsSchema = exports.setCredentialUsersSchema = exports.updateCredentialSchema = exports.createCredentialSchema = exports.listServicesSchema = exports.updateServiceSchema = exports.createServiceSchema = exports.credentialIdParamSchema = exports.serviceIdParamSchema = exports.providerIdParamSchema = void 0;
const zod_1 = require("zod");
const providerValidator_1 = require("./providerValidator");
Object.defineProperty(exports, "validateSchema", { enumerable: true, get: function () { return providerValidator_1.validateSchema; } });
Object.defineProperty(exports, "validateParams", { enumerable: true, get: function () { return providerValidator_1.validateParams; } });
Object.defineProperty(exports, "validateQuery", { enumerable: true, get: function () { return providerValidator_1.validateQuery; } });
exports.providerIdParamSchema = zod_1.z.object({ providerId: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0) });
exports.serviceIdParamSchema = zod_1.z.object({ id: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0) });
exports.credentialIdParamSchema = zod_1.z.object({ id: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0) });
exports.createServiceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(255),
    type: zod_1.z.enum(['zabbix', 'proxmox', 'grafana', 'erp', 'other']),
    url: zod_1.z.string().url(),
    description: zod_1.z.string().max(1000).optional(),
    isActive: zod_1.z.boolean().optional().default(true)
});
exports.updateServiceSchema = exports.createServiceSchema.partial().refine(d => Object.keys(d).length > 0);
exports.listServicesSchema = zod_1.z.object({ isActive: zod_1.z.union([zod_1.z.string().regex(/^(true|false)$/i).transform(v => v.toLowerCase() === 'true'), zod_1.z.boolean()]).optional() });
exports.createCredentialSchema = zod_1.z.object({
    label: zod_1.z.string().max(255).optional(),
    username: zod_1.z.string().min(1).max(255),
    password: zod_1.z.string().min(1).max(4096),
    isActive: zod_1.z.boolean().optional().default(true),
    visibility: zod_1.z.enum(['PUBLIC', 'PROVIDER_ONLY', 'CUSTOM']).optional().default('PROVIDER_ONLY')
});
exports.updateCredentialSchema = zod_1.z.object({
    label: zod_1.z.string().max(255).optional(),
    username: zod_1.z.string().min(1).max(255).optional(),
    password: zod_1.z.string().min(1).max(4096).optional(),
    isActive: zod_1.z.boolean().optional(),
    visibility: zod_1.z.enum(['PUBLIC', 'PROVIDER_ONLY', 'CUSTOM']).optional()
}).refine(d => Object.keys(d).length > 0);
exports.setCredentialUsersSchema = zod_1.z.object({ userIds: zod_1.z.array(zod_1.z.number().int().min(1)).min(1) });
exports.setCredentialGroupsSchema = zod_1.z.object({ groupIds: zod_1.z.array(zod_1.z.number().int().min(1)).min(1) });
