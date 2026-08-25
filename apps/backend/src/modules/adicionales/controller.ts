import { Request, Response } from 'express';
import { crudFactory } from '../../utils/crudFactory';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { Addon } from './model';

const addonsCrud = crudFactory(Addon, 'available');

export const getPublicAddons = asyncHandler(async (_req: Request, res: Response) => {
  const items = await addonsCrud.list({ public: true });
  sendSuccess(res, items);
});

export const getAdminAddons = asyncHandler(async (_req: Request, res: Response) => {
  const items = await addonsCrud.list();
  sendSuccess(res, items);
});

export const createAddon = asyncHandler(async (req: Request, res: Response) => {
  const created = await addonsCrud.create(req.body);
  if (!created) throw new AppError(500, 'No se pudo crear el adicional');
  sendSuccess(res, created, 201);
});

export const updateAddon = asyncHandler(async (req: Request, res: Response) => {
  const updated = await addonsCrud.update(req.params.id, req.body);
  if (!updated) throw new AppError(404, 'Adicional no encontrado');
  sendSuccess(res, updated);
});

export const toggleAddonActive = asyncHandler(async (req: Request, res: Response) => {
  const toggled = await addonsCrud.toggleActive(req.params.id);
  if (!toggled) throw new AppError(404, 'Adicional no encontrado');
  sendSuccess(res, toggled);
});

export const deleteAddon = asyncHandler(async (req: Request, res: Response) => {
  // Quitar el addon de los productos que lo referencian
  await Addon.findByIdAndDelete(req.params.id).exec();
  const { Product } = await import('../products/model');
  await Product.updateMany(
    {},
    { $pull: { addons: req.params.id } }
  ).exec();
  sendSuccess(res, { id: req.params.id });
});
