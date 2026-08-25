import { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { deleteImage, listImages, uploadImage } from './service';

/** GET /api/gallery/images (admin) */
export const getImages = asyncHandler(async (_req: Request, res: Response) => {
  const images = await listImages();
  sendSuccess(res, images);
});

/** POST /api/gallery/upload (admin) — multipart con campo "image" */
export const upload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError(400, 'Falta el archivo (campo "image")');

  const image = await uploadImage(req.file.buffer);
  sendSuccess(res, image, 201);
});

/** DELETE /api/gallery/images/:id (admin) */
export const removeImage = asyncHandler(async (req: Request, res: Response) => {
  await deleteImage(req.params.id);
  sendSuccess(res, { id: req.params.id });
});
