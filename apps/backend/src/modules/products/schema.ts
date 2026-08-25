import { z } from 'zod';

export const productCreateSchema = z.object({
  title: z.string().trim().min(1, 'El título es requerido').max(120),
  description: z.string().trim().max(500).optional(),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  image: z.string().trim().url('La imagen debe ser una URL válida').or(z.literal('')).optional(),
  category: z.string().trim().min(1, 'La categoría es requerida'),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  controlStock: z.boolean().optional(),
  stock: z.number().int().min(0).optional(),
  promotionalLabel: z.string().trim().max(60).optional(),
  addons: z.array(z.string()).max(30).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();
