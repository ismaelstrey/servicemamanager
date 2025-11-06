import { z } from 'zod';
import { validateQuery } from './providerValidator';

export const listCustomersSchema = z.object({
  search: z.string().min(1).max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  providerId: z.coerce.number().int().min(1).optional(),
});

export { validateQuery };