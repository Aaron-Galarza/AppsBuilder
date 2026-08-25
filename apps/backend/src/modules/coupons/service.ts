import { argWeekday } from '../../utils/timezone';
import { AppError } from '../../utils/AppError';
import type { PaymentMethod } from '@saas/types';
import { Coupon, CouponDoc } from './model';

const DAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/**
 * Valida y aplica un cupón sobre un subtotal.
 * Checks: existe + activo → días válidos → métodos de pago válidos.
 * Devuelve el documento del cupón (el descuento lo calcula el caller).
 */
export async function validateCouponForCart(
  rawCode: string,
  paymentMethod: PaymentMethod | null,
  subtotal: number
): Promise<CouponDoc> {
  const code = rawCode.trim().toUpperCase();

  const coupon = await Coupon.findOne({ code }).exec();
  if (!coupon) throw new AppError(404, 'El cupón no existe');
  if (!coupon.active) throw new AppError(409, 'El cupón no está activo');

  if (coupon.discountType === 'percentage' && coupon.discountValue > 100) {
    throw new AppError(409, 'Cupón mal configurado');
  }

  // Días de la semana válidos (0 = domingo)
  if (coupon.validDays && coupon.validDays.length > 0) {
    const todayIndex = DAY_INDEX[argWeekday()];
    if (!coupon.validDays.includes(todayIndex)) {
      throw new AppError(409, `El cupón no es válido hoy`);
    }
  }

  // Métodos de pago válidos
  if (coupon.validPaymentMethods && coupon.validPaymentMethods.length > 0) {
    if (!paymentMethod || !coupon.validPaymentMethods.includes(paymentMethod)) {
      throw new AppError(409, 'El cupón no aplica para ese método de pago');
    }
  }

  if (coupon.discountType === 'fixed' && subtotal < coupon.discountValue) {
    throw new AppError(409, 'El subtotal no alcanza para usar este cupón');
  }

  return coupon;
}

/** Descuento en pesos según el tipo de cupón (cap al subtotal) */
export function computeCouponDiscount(coupon: CouponDoc, subtotal: number): number {
  const discount =
    coupon.discountType === 'percentage'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
  return Math.min(discount, subtotal);
}
