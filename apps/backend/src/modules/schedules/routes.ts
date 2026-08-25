import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import {
  addDeliveryRange,
  bannerSchema,
  deliveryRangeSchema,
  emergencySchema,
  getConfig,
  getPublicStatus,
  rainBodySchema,
  removeDeliveryRange,
  scheduleBodySchema,
  updateBanner,
  updateEmergency,
  updateRain,
  updateSchedule,
} from './controller';

const router: Router = Router();

// Público
router.get('/status', getPublicStatus);

// Admin
router.get('/', requireAuth, getConfig);
router.put('/schedule', requireAuth, validate(scheduleBodySchema), updateSchedule);
router.put('/banner', requireAuth, validate(bannerSchema), updateBanner);
router.put('/rain', requireAuth, validate(rainBodySchema), updateRain);
router.put('/emergency', requireAuth, validate(emergencySchema), updateEmergency);
router.post('/delivery-ranges', requireAuth, validate(deliveryRangeSchema), addDeliveryRange);
router.delete('/delivery-ranges/:id', requireAuth, removeDeliveryRange);

export default router;
