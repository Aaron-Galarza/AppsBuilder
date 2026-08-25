import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { categoryCreateSchema, categoryUpdateSchema } from './schema';
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getPublicCategories,
  updateCategory,
} from './controller';

const router: Router = Router();

router.get('/public', getPublicCategories);
router.get('/admin', requireAuth, getAdminCategories);
router.post('/admin', requireAuth, validate(categoryCreateSchema), createCategory);
router.put('/admin/:id', requireAuth, validate(categoryUpdateSchema), updateCategory);
router.delete('/admin/:id', requireAuth, deleteCategory);

export default router;
