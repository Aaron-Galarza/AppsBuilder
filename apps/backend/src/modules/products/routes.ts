import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { productCreateSchema, productUpdateSchema } from './schema';
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getPublicProducts,
  toggleProductActive,
  updateProduct,
} from './controller';

const router: Router = Router();

// Públicos
router.get('/public', getPublicProducts);

// Admin (JWT) — rutas específicas ANTES de las parameterizadas
router.get('/admin', requireAuth, getAdminProducts);
router.post('/admin', requireAuth, validate(productCreateSchema), createProduct);
router.put('/admin/toggleActive/:id', requireAuth, toggleProductActive);
router.put('/admin/:id', requireAuth, validate(productUpdateSchema), updateProduct);
router.delete('/admin/:id', requireAuth, deleteProduct);

export default router;
