import { z } from 'zod';
import { validateSchema, validateParams, validateQuery } from './providerValidator';

export const createPasswordVaultSchema = z.object({
  label: z.string().min(2, 'label deve ter ao menos 2 caracteres'),
  username: z.string().min(1, 'username é obrigatório'),
  password: z.string().min(1, 'password é obrigatório'),
  expiresAt: z.coerce.date().optional(),
  rotationIntervalDays: z.coerce.number().int().min(1).max(365).optional()
});

export const updatePasswordVaultSchema = z.object({
  label: z.string().min(2).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  rotationIntervalDays: z.coerce.number().int().min(1).max(365).nullable().optional(),
  lastRotatedAt: z.coerce.date().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Ao menos um campo deve ser fornecido para atualização'
});

export const rotatePasswordSchema = z.object({
  password: z.string().min(8).max(128).optional(),
  length: z.coerce.number().int().min(8).max(128).optional(),
  includeUppercase: z.boolean().optional(),
  includeLowercase: z.boolean().optional(),
  includeNumbers: z.boolean().optional(),
  includeSymbols: z.boolean().optional(),
  excludeSimilar: z.boolean().optional(),
  excludeAmbiguous: z.boolean().optional(),
  customCharacters: z.string().max(256).optional(),
  pattern: z.string().optional()
}).refine((data) => !!data.password || !!(data.includeUppercase || data.includeLowercase || data.includeNumbers || data.includeSymbols), {
  message: 'Informe uma senha ou ao menos um tipo de caractere para geração'
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