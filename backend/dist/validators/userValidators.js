"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateSchema = exports.updateUserSchema = exports.createUserSchema = exports.listUsersSchema = exports.userIdParamSchema = void 0;
const zod_1 = require("zod");
const providerValidator_1 = require("./providerValidator");
Object.defineProperty(exports, "validateSchema", { enumerable: true, get: function () { return providerValidator_1.validateSchema; } });
Object.defineProperty(exports, "validateParams", { enumerable: true, get: function () { return providerValidator_1.validateParams; } });
Object.defineProperty(exports, "validateQuery", { enumerable: true, get: function () { return providerValidator_1.validateQuery; } });
exports.userIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0)
});
exports.listUsersSchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100).optional(),
    search: zod_1.z.string().min(1).max(255).trim().optional(),
    role: zod_1.z.enum(['admin', 'manager', 'user']).optional(),
    isActive: zod_1.z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    sortBy: zod_1.z.enum(['name', 'email', 'role', 'createdAt']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(255).trim(),
    email: zod_1.z.string().email().max(255).trim(),
    password: zod_1.z.string().min(8).max(255),
    role: zod_1.z.enum(['admin', 'manager', 'user']).optional()
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(255).trim().optional(),
    email: zod_1.z.string().email().max(255).trim().optional(),
    password: zod_1.z.string().min(8).max(255).optional(),
    role: zod_1.z.enum(['admin', 'manager', 'user']).optional()
}).refine(data => Object.keys(data).length > 0);
