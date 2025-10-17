import { z } from 'zod';

// Validação de credenciais para login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Validação de dados para registro
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;