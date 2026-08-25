import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { orderCreateSchema, orderStatusSchema } from './schema';
import { getAdminOrders, postOrder, putOrderStatus } from './controller';

const router: Router = Router();

// Público: crear pedido desde el checkout (source manual lo usa el admin)
router.post('/', validate(orderCreateSchema), postOrder);

// Admin
router.get('/admin', requireAuth, getAdminOrders);
router.put('/admin/:id/status', requireAuth, validate(orderStatusSchema), putOrderStatus);

export default router;
