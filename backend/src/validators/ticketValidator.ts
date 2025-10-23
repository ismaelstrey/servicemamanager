// Validadores Zod para operações de Tickets

import { z } from 'zod';
import { validateSchema, validateParams, validateQuery } from './providerValidator';

// Enums canônicos para tickets (alinhados ao schema do Prisma)
export const ticketStatusSchema = z.enum(['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled'], {
  errorMap: () => ({ message: 'Status deve ser open, assigned, in_progress, pending, resolved, closed ou cancelled' })
});

export const ticketPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'], {
  errorMap: () => ({ message: 'Prioridade deve ser low, medium, high ou critical' })
});

export const ticketCategorySchema = z.enum(['technical', 'billing', 'commercial', 'installation', 'maintenance', 'complaint', 'request', 'incident', 'change', 'other'], {
  errorMap: () => ({ message: 'Categoria deve ser technical, billing, commercial, installation, maintenance, complaint, request, incident, change ou other' })
});

export const ticketSourceSchema = z.enum(['manual', 'email', 'phone', 'chat', 'portal', 'api', 'zabbix', 'mobile', 'social', 'other'], {
  errorMap: () => ({ message: 'Fonte deve ser manual, email, phone, chat, portal, api, zabbix, mobile, social ou other' })
});

// Validador para email
const emailSchema = z.string()
  .email('Email deve ter um formato válido')
  .max(255, 'Email deve ter no máximo 255 caracteres')
  .trim()
  .toLowerCase();

// Validador para telefone (formato brasileiro)
const phoneSchema = z.string()
  .regex(/^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/, 'Telefone deve estar no formato válido brasileiro')
  .max(20, 'Telefone deve ter no máximo 20 caracteres')
  .trim();

// Schema para criação de ticket
export const createTicketSchema = z.object({
  title: z.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(255, 'Título deve ter no máximo 255 caracteres')
    .trim(),
  description: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(5000, 'Descrição deve ter no máximo 5000 caracteres')
    .trim(),
  status: ticketStatusSchema.optional().default('open'),
  priority: ticketPrioritySchema.optional().default('medium'),
  source: ticketSourceSchema.optional().default('manual')
});

// Schema para atualização de ticket
export const updateTicketSchema = z.object({
  title: z.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(255, 'Título deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  description: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(5000, 'Descrição deve ter no máximo 5000 caracteres')
    .trim()
    .optional(),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  source: ticketSourceSchema.optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
});

// Schema para listagem de tickets
export const listTicketsSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Página deve ser um número')
    .transform(Number)
    .refine(n => n > 0, 'Página deve ser maior que 0')
    .optional(),
  limit: z.string()
    .regex(/^\d+$/, 'Limite deve ser um número')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limite deve ser entre 1 e 100')
    .optional(),
  search: z.string()
    .min(1, 'Busca deve ter pelo menos 1 caractere')
    .max(255, 'Busca deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional()
});

// Params para rotas com providerId
export const providerIdParamSchema = z.object({
  providerId: z.string()
    .regex(/^\d+$/, 'providerId deve ser um número')
    .transform(Number)
    .refine(n => n > 0, 'providerId deve ser maior que 0')
});

// Params para rotas com ticket id
export const ticketIdParamSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'id deve ser um número')
    .transform(Number)
    .refine(n => n > 0, 'id deve ser maior que 0')
});

// Schema específico para alteração de status
export const updateTicketStatusSchema = z.object({
  status: ticketStatusSchema
});

// Exportar utilitários de validação
export { validateSchema, validateParams, validateQuery };