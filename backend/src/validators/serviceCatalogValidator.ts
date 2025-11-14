import { z } from 'zod'
import { validateSchema, validateParams, validateQuery } from './providerValidator'

export const providerIdParamSchema = z.object({ providerId: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0) })
export const serviceIdParamSchema = z.object({ id: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0) })
export const credentialIdParamSchema = z.object({ id: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0) })

export const createServiceSchema = z.object({
  name: z.string().min(2).max(255),
  type: z.enum(['zabbix','proxmox','grafana','erp','other']),
  url: z.string().url(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().optional().default(true)
})

export const updateServiceSchema = createServiceSchema.partial().refine(d => Object.keys(d).length > 0)

export const listServicesSchema = z.object({ isActive: z.union([z.string().regex(/^(true|false)$/i).transform(v => v.toLowerCase()==='true'), z.boolean()]).optional() })

export const createCredentialSchema = z.object({
  label: z.string().max(255).optional(),
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(4096),
  isActive: z.boolean().optional().default(true),
  visibility: z.enum(['PUBLIC','PROVIDER_ONLY','CUSTOM']).optional().default('PROVIDER_ONLY')
})

export const updateCredentialSchema = z.object({
  label: z.string().max(255).optional(),
  username: z.string().min(1).max(255).optional(),
  password: z.string().min(1).max(4096).optional(),
  isActive: z.boolean().optional(),
  visibility: z.enum(['PUBLIC','PROVIDER_ONLY','CUSTOM']).optional()
}).refine(d => Object.keys(d).length > 0)

export const setCredentialUsersSchema = z.object({ userIds: z.array(z.number().int().min(1)).min(1) })
export const setCredentialGroupsSchema = z.object({ groupIds: z.array(z.number().int().min(1)).min(1) })

export { validateSchema, validateParams, validateQuery }