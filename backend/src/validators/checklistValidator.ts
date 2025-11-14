import { z } from 'zod'
import { validateSchema, validateParams, validateQuery } from './providerValidator'

export const checklistTemplateItemSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  required: z.boolean().optional().default(false),
  order: z.number().int().min(0).optional().default(0)
})

export const createChecklistTemplateSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().max(1000).optional(),
  type: z.enum(['standard', 'routine']).optional().default('standard'),
  providerId: z.coerce.number().int().min(1),
  items: z.array(checklistTemplateItemSchema).min(1)
})

export const updateChecklistTemplateSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().max(1000).optional(),
  type: z.enum(['standard', 'routine']).optional(),
  items: z.array(checklistTemplateItemSchema).min(1).optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Forneça campos para atualizar' })

export const templateIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0)
})

export const createChecklistLinkSchema = z.object({
  checklistTemplateId: z.coerce.number().int().min(1),
  resourceType: z.enum(['TICKET', 'SERVICE_ORDER']),
  resourceId: z.coerce.number().int().min(1)
})

export const linkIdParamSchema = z.object({
  linkId: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0)
})

export const updateChecklistItemSchema = z.object({
  done: z.boolean().optional(),
  note: z.string().max(1000).optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Forneça campos para atualizar' })

export { validateSchema, validateParams, validateQuery }