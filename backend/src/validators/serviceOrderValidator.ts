import { z } from 'zod';
import { validateSchema, validateParams, validateQuery } from './providerValidator';
import { ServiceOrderStatus, ServiceOrderPriority } from '@prisma/client';

// Enums for service orders
export const serviceOrderStatusSchema = z.nativeEnum(ServiceOrderStatus, {
  errorMap: () => ({ message: 'Status inválido' })
});

export const serviceOrderPrioritySchema = z.nativeEnum(ServiceOrderPriority, {
  errorMap: () => ({ message: 'Prioridade inválida' })
});

// Schema for creating service order
export const createServiceOrderSchema = z.object({
  title: z.string()
    .min(3, 'Título deve ter entre 3 e 255 caracteres')
    .max(255, 'Título deve ter entre 3 e 255 caracteres')
    .trim(),
  description: z.string()
    .min(10, 'Descrição deve ter entre 10 e 2000 caracteres')
    .max(2000, 'Descrição deve ter entre 10 e 2000 caracteres')
    .trim(),
  status: serviceOrderStatusSchema.optional(),
  priority: serviceOrderPrioritySchema.optional(),
  scheduledDate: z.string().datetime('Data agendada deve estar no formato ISO8601').optional()
    .refine((value) => {
      if (value) {
        const date = new Date(value);
        const now = new Date();
        return date >= now;
      }
      return true;
    }, { message: 'Data agendada não pode ser no passado' }),
  estimatedHours: z.number().min(0.1, 'Horas estimadas devem ser um número entre 0.1 e 1000').max(1000, 'Horas estimadas devem ser um número entre 0.1 e 1000').optional(),
  cost: z.number().min(0, 'Custo deve ser um número positivo').optional(),
  notes: z.string().max(2000, 'Notas não podem exceder 2000 caracteres').optional(),
  providerId: z.number().int().min(1, 'ID do provedor deve ser um número inteiro positivo'),
  ticketId: z.number().int().min(1, 'ID do ticket deve ser um número inteiro positivo').optional()
});

// Schema for updating service order
export const updateServiceOrderSchema = z.object({
  title: z.string()
    .min(3, 'Título deve ter entre 3 e 255 caracteres')
    .max(255, 'Título deve ter entre 3 e 255 caracteres')
    .trim()
    .optional(),
  description: z.string()
    .min(10, 'Descrição deve ter entre 10 e 2000 caracteres')
    .max(2000, 'Descrição deve ter entre 10 e 2000 caracteres')
    .trim()
    .optional(),
  status: serviceOrderStatusSchema.optional(),
  priority: serviceOrderPrioritySchema.optional(),
  scheduledDate: z.string().datetime('Data agendada deve estar no formato ISO8601').optional(),
  startedAt: z.string().datetime('Data de início deve estar no formato ISO8601').optional(),
  completedAt: z.string().datetime('Data de conclusão deve estar no formato ISO8601').optional(),
  estimatedHours: z.number().min(0.1, 'Horas estimadas devem ser um número entre 0.1 e 1000').max(1000, 'Horas estimadas devem ser um número entre 0.1 e 1000').optional(),
  actualHours: z.number().min(0.1, 'Horas reais devem ser um número entre 0.1 e 1000').max(1000, 'Horas reais devem ser um número entre 0.1 e 1000').optional(),
  cost: z.number().min(0, 'Custo deve ser um número positivo').optional(),
  notes: z.string().max(2000, 'Notas não podem exceder 2000 caracteres').optional(),
  ticketId: z.number().int().min(1, 'ID do ticket deve ser um número inteiro positivo').optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Ao menos um campo deve ser fornecido para atualização'
});

// Schema for updating service order status
export const updateServiceOrderStatusSchema = z.object({
  status: serviceOrderStatusSchema
});

// Schema for listing service orders
export const listServiceOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: serviceOrderStatusSchema.optional(),
  priority: serviceOrderPrioritySchema.optional(),
  providerId: z.coerce.number().int().min(1).optional()
});

// Schema for history pagination
export const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

// Schema for service order stats
export const serviceOrderStatsSchema = z.object({
  providerId: z.coerce.number().int().min(1).optional()
});

// Params for routes with service order id
export const serviceOrderIdParamSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID deve ser um número inteiro positivo')
    .transform(Number)
    .refine(n => n > 0, 'ID deve ser um número inteiro positivo')
});

// Export validation utilities
export { validateSchema, validateParams, validateQuery };