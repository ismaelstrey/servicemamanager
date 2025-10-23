"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateSchema = exports.vaultIdParamSchema = exports.providerIdParamSchema = exports.listPasswordVaultsSchema = exports.updatePasswordVaultSchema = exports.createPasswordVaultSchema = void 0;
const zod_1 = require("zod");
const providerValidator_1 = require("./providerValidator");
Object.defineProperty(exports, "validateSchema", { enumerable: true, get: function () { return providerValidator_1.validateSchema; } });
Object.defineProperty(exports, "validateParams", { enumerable: true, get: function () { return providerValidator_1.validateParams; } });
Object.defineProperty(exports, "validateQuery", { enumerable: true, get: function () { return providerValidator_1.validateQuery; } });
exports.createPasswordVaultSchema = zod_1.z.object({
    label: zod_1.z.string().min(2, 'label deve ter ao menos 2 caracteres'),
    username: zod_1.z.string().min(1, 'username é obrigatório'),
    password: zod_1.z.string().min(1, 'password é obrigatório')
});
exports.updatePasswordVaultSchema = zod_1.z.object({
    label: zod_1.z.string().min(2).optional(),
    username: zod_1.z.string().min(1).optional(),
    password: zod_1.z.string().min(1).optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: 'Ao menos um campo deve ser fornecido para atualização'
});
exports.listPasswordVaultsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    search: zod_1.z.string().optional()
});
exports.providerIdParamSchema = zod_1.z.object({
    providerId: zod_1.z.string().regex(/^\d+$/, 'providerId deve ser numérico')
});
exports.vaultIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'id deve ser numérico')
});
