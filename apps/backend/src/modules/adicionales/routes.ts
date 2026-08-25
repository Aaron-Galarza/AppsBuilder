import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { addonCreateSchema, addonUpdateSchema } from './schema';
import {
  createAddon,
  deleteAddon,
  getAdminAddons,
  getPublicAddons,
  toggleAddonActive,
  updateAddon,
} from './controller';

const router: Router = Router();

router.get('/public', getPublicAddons);
router.get('/admin', requireAuth, getAdminAddons);
router.post('/admin', requireAuth, validate(addonCreateSchema), createAddon);
router.put('/admin/:id', requireAuth, validate(addonUpdateSchema), updateAddon);
router.put('/admin/toggleActive/:id', requireAuth, toggleAddonActive);
router.delete('/admin/:id', requireAuth, deleteAddon);

export default router;
