import { z } from 'zod'
import { validateSchema, validateParams, validateQuery } from './providerValidator'

export const providerIdParamSchema = z.object({
  providerId: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0)
})

export const branchIdParamSchema = z.object({ id: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0) })

const phoneSchema = z.string().regex(/^\+?[0-9\s()-]{7,20}$/).optional()
const emailSchema = z.string().email().optional()

export const createBranchSchema = z.object({
  name: z.string().min(2).max(255),
  phone: phoneSchema,
  email: emailSchema,
  address: z.any().optional(),
  notes: z.string().max(1000).optional()
})

export const updateBranchSchema = createBranchSchema.partial().refine(d => Object.keys(d).length > 0)

export { validateSchema, validateParams, validateQuery }