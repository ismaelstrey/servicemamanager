"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.listCustomersSchema = void 0;
const zod_1 = require("zod");
const providerValidator_1 = require("./providerValidator");
Object.defineProperty(exports, "validateQuery", { enumerable: true, get: function () { return providerValidator_1.validateQuery; } });
exports.listCustomersSchema = zod_1.z.object({
    // Campo de busca: aceitar string vazia e convertê-la para undefined
    // Isso evita erro 400 quando o frontend envia `search=""` em autocomplete
    search: zod_1.z.preprocess((val) => (typeof val === 'string' && val.trim() === '' ? undefined : val), zod_1.z.string().trim().min(1).max(255).optional()),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    providerId: zod_1.z.coerce.number().int().min(1).optional(),
});
