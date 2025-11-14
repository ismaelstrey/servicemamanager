import { z } from 'zod'
import { validateSchema, validateParams, validateQuery } from './providerValidator'

export const daysOfWeekSchema = z.object({
  mon: z.boolean(),
  tue: z.boolean(),
  wed: z.boolean(),
  thu: z.boolean(),
  fri: z.boolean(),
  sat: z.boolean(),
  sun: z.boolean()
}).refine(d => Object.values(d).some(Boolean), { message: 'Ao menos um dia deve estar ativo' })

export const createRoutineSchema = z.object({
  name: z.string().min(2).max(255),
  enabled: z.boolean().optional().default(true),
  providerId: z.coerce.number().int().min(1),
  targetType: z.enum(['ALL_CUSTOMERS', 'CUSTOMER_IDS', 'CUSTOMER_GROUP']),
  targetIds: z.array(z.coerce.number().int().min(1)).optional(),
  daysOfWeek: daysOfWeekSchema,
  time: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().optional(),
  createFor: z.enum(['TICKET', 'SERVICE_ORDER']).default('TICKET'),
  templateId: z.coerce.number().int().min(1).optional(),
  defaultCategory: z.string().optional(),
  defaultPriority: z.enum(['low','medium','high','urgent']).optional(),
  defaultSource: z.enum(['manual','email','phone','chat','portal','api','zabbix','mobile','social','other']).optional()
})

export const updateRoutineSchema = createRoutineSchema.partial().refine(data => Object.keys(data).length > 0, { message: 'Forneça campos para atualizar' })

export const routineIdParamSchema = z.object({ id: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0) })

export const listRoutinesSchema = z.object({
  providerId: z.coerce.number().int().min(1).optional(),
  enabled: z.union([z.string().regex(/^(true|false)$/i).transform(v => v.toLowerCase() === 'true'), z.boolean()]).optional()
})

export { validateSchema, validateParams, validateQuery }