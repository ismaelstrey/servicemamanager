import { z } from 'zod';

export const clientCreateServiceOrderSchema = z.object({
  title: z.string().min(3).max(255).trim(),
  description: z.string().min(10).max(2000).trim(),
  scheduledDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0.1).max(1000).optional(),
  notes: z.string().max(2000).optional()
});

export const clientListServiceOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.string().optional()
});

export const clientCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const clientQualificationSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  feedback: z.string().min(1).max(2000).optional()
});

export const clientUpdateProfileSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(255).trim().optional(),
  phone: z
    .string()
    .regex(/^\d{10,11}$/i, 'Telefone deve conter 10 ou 11 dígitos numéricos')
    .optional(),
  document: z.string().min(11, 'Documento muito curto').max(18).optional(),
})
.superRefine((data, ctx) => {
  if (
    data.name === undefined &&
    data.phone === undefined &&
    data.document === undefined
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Informe pelo menos um campo para atualizar',
      path: ['_'],
    });
  }
});

export const clientUpdateServiceOrderSchema = z.object({
  title: z.string()
    .min(3, 'Título deve ter entre 3 e 255 caracteres')
    .max(255, 'Título deve ter entre 3 e 255 caracteres')
    .trim()
    .optional(),
  description: z.string()
    .min(10, 'Descrição deve ter entre 10 e 2000 caracteres')
    .max(2000, 'Descrição deve ter entre 10 e 2000 caracteres')
    .trim()
    .optional(),
  scheduledDate: z.string().datetime('Data agendada deve estar no formato ISO8601').optional()
    .refine((value) => {
      if (value) {
        const date = new Date(value);
        const now = new Date();
        return date >= now;
      }
      return true;
    }, { message: 'Data agendada não pode ser no passado' }),
  estimatedHours: z.number().min(0.1, 'Horas estimadas devem ser um número entre 0.1 e 1000').max(1000, 'Horas estimadas devem ser um número entre 0.1 e 1000').optional(),
  notes: z.string().max(2000, 'Notas não podem exceder 2000 caracteres').optional()
}).superRefine((data, ctx) => {
  if (
    data.title === undefined &&
    data.description === undefined &&
    data.scheduledDate === undefined &&
    data.estimatedHours === undefined &&
    data.notes === undefined
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Informe ao menos um campo para atualizar',
      path: ['_'],
    });
  }
});