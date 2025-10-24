import { z } from 'zod';
import { validateSchema, validateParams, validateQuery } from './providerValidator';

// Schema para listagem de notificações
export const listNotificationsSchema = z.object({
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
  unread: z.union([
    z.string().regex(/^(true|false)$/i, 'unread deve ser true ou false').transform(v => v.toLowerCase() === 'true'),
    z.boolean()
  ]).optional()
});

// Params para rotas com providerId
export const providerIdParamSchema = z.object({
  providerId: z.string()
    .regex(/^\d+$/, 'providerId deve ser um número')
    .transform(Number)
    .refine(n => n > 0, 'providerId deve ser maior que 0')
});

// Params para rotas com notification id
export const notificationIdParamSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'id deve ser um número')
    .transform(Number)
    .refine(n => n > 0, 'id deve ser maior que 0')
});

// Exportar utilitários de validação
export { validateSchema, validateParams, validateQuery };