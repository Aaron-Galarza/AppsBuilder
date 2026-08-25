import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { loginSchema } from './schema';
import { login } from './controller';

const router: Router = Router();

router.post('/login', validate(loginSchema), login);

export default router;
