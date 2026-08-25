import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { geocodingSchema } from './schema';
import { geocode } from './controller';

const router: Router = Router();

router.post('/', validate(geocodingSchema), geocode);

export default router;
