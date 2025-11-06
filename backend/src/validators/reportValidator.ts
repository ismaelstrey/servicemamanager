import { z } from 'zod';
import { validateQuery } from './providerValidator';

// Comentário: Schemas de validação para filtros de relatórios (tickets e ordens de serviço)
// Campos comuns: período, status, paginação e providerId (injetado pelo middleware, mas permitido via query para serviços internos)

const dateSchema = z.string().datetime('Data deve estar no formato ISO8601');

export const reportFilterSchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  status: z.string().min(1).optional(),
  tag: z.string().min(1).optional(),
  assigneeId: z.coerce.number().int().min(1).optional(),
  customerId: z.coerce.number().int().min(1).optional(),
  priority: z.enum(['low','medium','high','urgent']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, { message: 'Período inválido: startDate deve ser menor ou igual a endDate' });

// Comentário: Schema para exportação de relatório
export const exportReportSchema = z.object({
  type: z.enum(['tickets', 'service_orders']),
  format: z.enum(['csv', 'xlsx', 'pdf']).default('csv'),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  status: z.string().min(1).optional(),
  priority: z.enum(['low','medium','high','urgent']).optional(),
  customerId: z.coerce.number().int().min(1).optional(),
});

// Utilitário de validação de query (seguindo padrão do projeto)
export { validateQuery };