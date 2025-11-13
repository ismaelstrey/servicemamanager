import { z } from 'zod'
import { validateSchema, validateParams, validateQuery } from './providerValidator'

export const userIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0)
})

export const listUsersSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100).optional(),
  search: z.string().min(1).max(255).trim().optional(),
  role: z.enum(['admin','manager','user']).optional(),
  isActive: z.enum(['true','false']).transform(v => v === 'true').optional(),
  sortBy: z.enum(['name','email','role','createdAt']).optional(),
  sortOrder: z.enum(['asc','desc']).optional()
})

export const createUserSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.string().email().max(255).trim(),
  password: z.string().min(8).max(255),
  role: z.enum(['admin','manager','user']).optional()
})

export const updateUserSchema = z.object({
  name: z.string().min(2).max(255).trim().optional(),
  email: z.string().email().max(255).trim().optional(),
  password: z.string().min(8).max(255).optional(),
  role: z.enum(['admin','manager','user']).optional()
}).refine(data => Object.keys(data).length > 0)

export { validateSchema, validateParams, validateQuery }
