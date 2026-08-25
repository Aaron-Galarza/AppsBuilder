import { Request, Response } from 'express';
import { crudFactory } from '../../utils/crudFactory';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { Category } from './model';

const categoriesCrud = crudFactory(Category, 'active');

export const getPublicCategories = asyncHandler(async (_req: Request, res: Response) => {
  const items = await categoriesCrud.list({ public: true });
  sendSuccess(res, items);
});

export const getAdminCategories = asyncHandler(async (_req: Request, res: Response) => {
  const items = await categoriesCrud.list();
  sendSuccess(res, items);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const created = await categoriesCrud.create(req.body);
  if (!created) throw new AppError(500, 'No se pudo crear la categoría');
  sendSuccess(res, created, 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const updated = await categoriesCrud.update(req.params.id, req.body);
  if (!updated) throw new AppError(404, 'Categoría no encontrada');
  sendSuccess(res, updated);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  // Validar que no tenga productos asociados antes de borrar
  const { Product } = await import('../products/model');
  const category = await Category.findById(req.params.id).exec();
  if (!category) throw new AppError(404, 'Categoría no encontrada');

  const productsCount = await Product.countDocuments({ category: req.params.id }).exec();
  if (productsCount > 0) {
    throw new AppError(
      409,
      `No se puede borrar: hay ${productsCount} producto(s) en esta categoría`
    );
  }

  await categoriesCrud.remove(req.params.id);
  sendSuccess(res, { id: req.params.id });
});
