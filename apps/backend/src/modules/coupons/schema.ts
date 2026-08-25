import { z } from 'zod';

export const couponCreateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(20)
    .regex(/^[A-Za-z0-9]+$/, 'Solo letras y números'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive('El valor debe ser mayor a cero'),
  active: z.boolean().optional(),
  validDays: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  validPaymentMethods: z.array(z.string()).max(4).optional(),
});

export const couponUpdateSchema = couponCreateSchema.partial();
