import { z } from 'zod'
import { validateSchema, validateParams, validateQuery } from './providerValidator'

export const providerIdParamSchema = z.object({ providerId: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0) })
export const groupIdParamSchema = z.object({ id: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0) })

export const createGroupSchema = z.object({ name: z.string().min(2).max(255), description: z.string().max(1000).optional() })
export const updateGroupSchema = z.object({ name: z.string().min(2).max(255).optional(), description: z.string().max(1000).optional() }).refine(d => Object.keys(d).length>0)
export const addMembersSchema = z.object({ providerUserIds: z.array(z.number().int().min(1)).min(1) })

export { validateSchema, validateParams, validateQuery }