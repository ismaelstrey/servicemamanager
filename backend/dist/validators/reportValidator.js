"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.exportReportSchema = exports.reportFilterSchema = void 0;
const zod_1 = require("zod");
const providerValidator_1 = require("./providerValidator");
Object.defineProperty(exports, "validateQuery", { enumerable: true, get: function () { return providerValidator_1.validateQuery; } });
// Comentário: Schemas de validação para filtros de relatórios (tickets e ordens de serviço)
// Campos comuns: período, status, paginação e providerId (injetado pelo middleware, mas permitido via query para serviços internos)
const dateSchema = zod_1.z.string().datetime('Data deve estar no formato ISO8601');
exports.reportFilterSchema = zod_1.z.object({
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    status: zod_1.z.string().min(1).optional(),
    tag: zod_1.z.string().min(1).optional(),
    assigneeId: zod_1.z.coerce.number().int().min(1).optional(),
    customerId: zod_1.z.coerce.number().int().min(1).optional(),
    // Permitir providerId na query para não ser removido pelo middleware
    providerId: zod_1.z.coerce.number().int().min(1).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, { message: 'Período inválido: startDate deve ser menor ou igual a endDate' });
// Comentário: Schema para exportação de relatório
exports.exportReportSchema = zod_1.z.object({
    type: zod_1.z.enum(['tickets', 'service_orders']),
    format: zod_1.z.enum(['csv', 'xlsx', 'pdf']).default('csv'),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    status: zod_1.z.string().min(1).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    customerId: zod_1.z.coerce.number().int().min(1).optional(),
    // Permitir providerId na exportação também
    providerId: zod_1.z.coerce.number().int().min(1).optional(),
});
