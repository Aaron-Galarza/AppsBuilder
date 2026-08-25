import { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import type { PaymentMethod } from '@saas/types';
import { Coupon } from './model';
import { computeCouponDiscount, validateCouponForCart } from './service';

/** GET /api/coupons/admin */
export const getAdminCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Coupon.find().sort({ createdAt: -1 }).exec();
  sendSuccess(res, items);
});

/** POST /api/coupons/admin */
export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const created = await Coupon.create(req.body);
  sendSuccess(res, created, 201);
});

/** PUT /api/coupons/admin/:id */
export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const updated = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).exec();
  if (!updated) throw new AppError(404, 'Cupón no encontrado');
  sendSuccess(res, updated);
});

/** PUT /api/coupons/admin/:id/toggle */
export const toggleCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Coupon.findById(req.params.id).exec();
  if (!coupon) throw new AppError(404, 'Cupón no encontrado');
  coupon.active = !coupon.active;
  await coupon.save();
  sendSuccess(res, coupon);
});

/** DELETE /api/coupons/admin/:id */
export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const deleted = await Coupon.findByIdAndDelete(req.params.id).exec();
  if (!deleted) throw new AppError(404, 'Cupón no encontrado');
  sendSuccess(res, { id: req.params.id });
});

/**
 * POST /api/coupons/validate/:code
 * Body opcional: {paymentMethod?, deliveryType?, subtotal?}
 * Valida vigencia/días/métodos y devuelve el cupón con el descuento calculado.
 */
export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const subtotal = Number(req.body?.subtotal ?? 0);
  const paymentMethod = (req.body?.paymentMethod ?? null) as PaymentMethod | null;

  const coupon = await validateCouponForCart(req.params.code, paymentMethod, subtotal);

  sendSuccess(res, {
    ...coupon.toObject(),
    discountAmount: computeCouponDiscount(coupon, subtotal),
  });
});
