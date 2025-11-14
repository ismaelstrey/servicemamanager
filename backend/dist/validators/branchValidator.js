"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateSchema = exports.updateBranchSchema = exports.createBranchSchema = exports.branchIdParamSchema = exports.providerIdParamSchema = void 0;
const zod_1 = require("zod");
const providerValidator_1 = require("./providerValidator");
Object.defineProperty(exports, "validateSchema", { enumerable: true, get: function () { return providerValidator_1.validateSchema; } });
Object.defineProperty(exports, "validateParams", { enumerable: true, get: function () { return providerValidator_1.validateParams; } });
Object.defineProperty(exports, "validateQuery", { enumerable: true, get: function () { return providerValidator_1.validateQuery; } });
exports.providerIdParamSchema = zod_1.z.object({
    providerId: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0)
});
exports.branchIdParamSchema = zod_1.z.object({ id: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0) });
const phoneSchema = zod_1.z.string().regex(/^\+?[0-9\s()-]{7,20}$/).optional();
const emailSchema = zod_1.z.string().email().optional();
exports.createBranchSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(255),
    phone: phoneSchema,
    email: emailSchema,
    address: zod_1.z.any().optional(),
    notes: zod_1.z.string().max(1000).optional()
});
exports.updateBranchSchema = exports.createBranchSchema.partial().refine(d => Object.keys(d).length > 0);
