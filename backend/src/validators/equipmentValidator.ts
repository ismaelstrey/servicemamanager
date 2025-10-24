// Validadores Zod para operações de Equipamentos

import { z } from 'zod';
import { validateSchema, validateParams, validateQuery } from './providerValidator';

// Tipos válidos de equipamentos (enum canônico)
export const equipmentTypeSchema = z.enum(['switch', 'olt', 'router', 'server', 'virtualizer', 'other'], {
  errorMap: () => ({ message: 'Tipo deve ser switch, olt, router, server, virtualizer ou other' })
});

// Enum para status de equipamento
export const equipmentStatusSchema = z.enum(['active', 'inactive', 'maintenance'], {
  errorMap: () => ({ message: 'Status deve ser active, inactive ou maintenance' })
});

// Schema para criação de equipamento
export const createEquipmentSchema = z.object({
  label: z.string()
    .min(2, 'Label deve ter pelo menos 2 caracteres')
    .max(255, 'Label deve ter no máximo 255 caracteres')
    .trim(),
  type: equipmentTypeSchema,
  serial: z.string()
    .min(3, 'Serial deve ter pelo menos 3 caracteres')
    .max(255, 'Serial deve ter no máximo 255 caracteres')
    .trim(),
  status: equipmentStatusSchema.optional().default('active')
});

// Schema para atualização de equipamento
export const updateEquipmentSchema = z.object({
  label: z.string()
    .min(2, 'Label deve ter pelo menos 2 caracteres')
    .max(255, 'Label deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  type: equipmentTypeSchema.optional(),
  serial: z.string()
    .min(3, 'Serial deve ter pelo menos 3 caracteres')
    .max(255, 'Serial deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  status: equipmentStatusSchema.optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
});

// Schema para listagem de equipamentos
export const listEquipmentsSchema = z.object({
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
  type: equipmentTypeSchema.optional(),
  status: equipmentStatusSchema.optional()
});

// Schema de paginação para histórico
export const historyQuerySchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Página deve ser um número')
    .transform(Number)
    .refine(n => n > 0, 'Página deve ser maior que 0')
    .optional(),
  limit: z.string()
    .regex(/^\d+$/, 'Limite deve ser um número')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limite deve ser entre 1 e 100')
    .optional()
});

// Params para rotas com providerId
export const providerIdParamSchema = z.object({
  providerId: z.string()
    .regex(/^\d+$/, 'providerId deve ser um número')
    .transform(Number)
    .refine(n => n > 0, 'providerId deve ser maior que 0')
});

// Params para rotas com equipment id
export const equipmentIdParamSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'id deve ser um número')
    .transform(Number)
    .refine(n => n > 0, 'id deve ser maior que 0')
});

// Exportar os validadores reutilizáveis
export { validateSchema, validateParams, validateQuery };