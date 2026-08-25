import { Request, Response } from 'express';
import { crudFactory } from '../../utils/crudFactory';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { Product } from './model';

const productsCrud = crudFactory(Product, 'available');

/** GET /api/products/public — solo disponibles (menú del cliente) */
export const getPublicProducts = asyncHandler(async (_req: Request, res: Response) => {
  const items = await productsCrud.list({ public: true });
  sendSuccess(res, items);
});

/** GET /api/products/admin — todos (requiere JWT) */
export const getAdminProducts = asyncHandler(async (_req: Request, res: Response) => {
  const items = await productsCrud.list();
  sendSuccess(res, items);
});

/** POST /api/products/admin */
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const created = await productsCrud.create(req.body);
  if (!created) throw new AppError(500, 'No se pudo crear el producto');
  sendSuccess(res, created, 201);
});

/** PUT /api/products/admin/:id */
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const updated = await productsCrud.update(req.params.id, req.body);
  if (!updated) throw new AppError(404, 'Producto no encontrado');
  sendSuccess(res, updated);
});

/** PUT /api/products/admin/toggleActive/:id */
export const toggleProductActive = asyncHandler(async (req: Request, res: Response) => {
  const toggled = await productsCrud.toggleActive(req.params.id);
  if (!toggled) throw new AppError(404, 'Producto no encontrado');
  sendSuccess(res, toggled);
});

/** DELETE /api/products/admin/:id */
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const deleted = await productsCrud.remove(req.params.id);
  if (!deleted) throw new AppError(404, 'Producto no encontrado');
  sendSuccess(res, { id: req.params.id });
});
