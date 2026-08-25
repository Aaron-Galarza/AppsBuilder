import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { calculateDeliverySchema } from './schema';
import { calculateDeliveryCost } from './controller';

const router: Router = Router();

router.post('/calculate', validate(calculateDeliverySchema), calculateDeliveryCost);

export default router;
