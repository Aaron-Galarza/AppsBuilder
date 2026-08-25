import { z } from 'zod';

export const addonCreateSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(60),
  price: z.number().min(0),
  available: z.boolean().optional(),
  categories: z.array(z.string()).max(10).optional(),
});

export const addonUpdateSchema = addonCreateSchema.partial();
