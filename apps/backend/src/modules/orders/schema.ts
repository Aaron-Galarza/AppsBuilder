import { z } from 'zod';

export const orderCreateSchema = z.object({
  source: z.enum(['web', 'manual']).optional(),
  customer: z.object({
    name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(80),
    phone: z.string().trim().min(6, 'Teléfono inválido').max(20),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
        addons: z
          .array(
            z.object({
              addonId: z.string().min(1),
              quantity: z.number().int().min(1).max(10).default(1),
            })
          )
          .max(15)
          .default([]),
      })
    )
    .min(1, 'El pedido necesita al menos un item')
    .max(40),
  deliveryType: z.enum(['pickup', 'delivery']).optional(),
  paymentMethod: z.enum(['cash', 'debito', 'credito', 'transferencia']),
  couponCode: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(300).optional(),
  delivery: z
    .object({
      address: z.string().trim().min(5, 'Dirección muy corta').max(200),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
});
