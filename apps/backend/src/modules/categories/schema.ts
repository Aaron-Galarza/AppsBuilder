import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(60),
  icon: z.string().trim().max(40).optional(),
  active: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();
