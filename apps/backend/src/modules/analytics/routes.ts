import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { getAnalyticsStats } from './controller';

const router: Router = Router();

router.get('/', requireAuth, getAnalyticsStats);

export default router;
