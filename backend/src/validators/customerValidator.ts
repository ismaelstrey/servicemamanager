import { z } from 'zod';
import { validateQuery } from './providerValidator';

export const listCustomersSchema = z.object({
  // Campo de busca: aceitar string vazia e convertê-la para undefined
  // Isso evita erro 400 quando o frontend envia `search=""` em autocomplete
  search: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().trim().min(1).max(255).optional()
  ),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  providerId: z.coerce.number().int().min(1).optional(),
});

export { validateQuery };