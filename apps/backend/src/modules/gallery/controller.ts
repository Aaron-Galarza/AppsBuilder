import { Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { addImageByUrl, deleteImage, listImages, uploadImage } from './service';

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

const urlSchema = z.object({
  url: z.string().trim().url('URL inválida').max(500),
});

/** POST /api/gallery/url (admin) — agrega una imagen por URL */
export const addFromUrl = asyncHandler(async (req: Request, res: Response) => {
  const parsed = urlSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message);

  const image = await addImageByUrl(parsed.data.url);
  sendSuccess(res, image, 201);
});

/** DELETE /api/gallery/images/:id (admin) */
export const removeImage = asyncHandler(async (req: Request, res: Response) => {
  await deleteImage(req.params.id);
  sendSuccess(res, { id: req.params.id });
});
