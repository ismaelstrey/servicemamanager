import { z } from 'zod';
import { validateSchema, validateParams, validateQuery } from './providerValidator';

export const createPasswordVaultSchema = z.object({
  label: z.string().min(2, 'label deve ter ao menos 2 caracteres'),
  username: z.string().min(1, 'username é obrigatório'),
  password: z.string().min(1, 'password é obrigatório')
});

export const updatePasswordVaultSchema = z.object({
  label: z.string().min(2).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Ao menos um campo deve ser fornecido para atualização'
});

export const listPasswordVaultsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional()
});

export const providerIdParamSchema = z.object({
  providerId: z.string().regex(/^\d+$/, 'providerId deve ser numérico')
});

export const vaultIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'id deve ser numérico')
});

export { validateSchema, validateParams, validateQuery };