import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { couponCreateSchema, couponUpdateSchema } from './schema';
import {
  createCoupon,
  deleteCoupon,
  getAdminCoupons,
  toggleCoupon,
  updateCoupon,
  validateCoupon,
} from './controller';

const router: Router = Router();

// Público (validar cupón desde el checkout)
router.post('/validate/:code', validateCoupon);

// Admin
router.get('/admin', requireAuth, getAdminCoupons);
router.post('/admin', requireAuth, validate(couponCreateSchema), createCoupon);
router.put('/admin/:id', requireAuth, validate(couponUpdateSchema), updateCoupon);
router.put('/admin/:id/toggle', requireAuth, toggleCoupon);
router.delete('/admin/:id', requireAuth, deleteCoupon);

export default router;
