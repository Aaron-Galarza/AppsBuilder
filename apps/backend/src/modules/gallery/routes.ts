import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middlewares/auth';
import { getImages, removeImage, upload } from './controller';

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Solo se permiten imágenes'));
  },
});

const router: Router = Router();

router.get('/images', requireAuth, getImages);
router.post('/upload', requireAuth, uploadMiddleware.single('image'), upload);
router.delete('/images/:id', requireAuth, removeImage);

export default router;
