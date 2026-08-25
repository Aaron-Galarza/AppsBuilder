import { Model } from 'mongoose';
import { AppError } from './AppError';

export interface CrudControllers<T> {
  list: (filter?: Record<string, unknown>) => Promise<T[]>;
  create: (data: Record<string, unknown>) => Promise<T>;
  update: (id: string, data: Record<string, unknown>) => Promise<T | null>;
  toggleActive: (id: string) => Promise<T | null>;
  remove: (id: string) => Promise<T | null>;
}

/**
 * ABM genérico para modelos con campo `active`/`available` booleano.
 * `activeField` define qué campo se togglea (available en productos/adicionales,
 * active en categorías/cupones).
 */
export function crudFactory<T>(Model: Model<any>, activeField: 'active' | 'available' = 'active'): CrudControllers<T> {
  return {
    list: async (filter: Record<string, unknown> = {}) => {
      const query = { ...filter } as Record<string, unknown>;
      if (query.public) {
        delete query.public;
        query[activeField] = true;
      }
      return Model.find(query).sort({ order: 1, createdAt: -1 }).exec() as Promise<T[]>;
    },

    create: async (data: Record<string, unknown>) => {
      return Model.create(data) as Promise<T>;
    },

    update: async (id: string, data: Record<string, unknown>) => {
      return Model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).exec() as Promise<T | null>;
    },

    toggleActive: async (id: string) => {
      const doc = await Model.findById(id).exec();
      if (!doc) throw new AppError(404, 'No encontrado');
      const current = doc.get(activeField) as boolean | undefined;
      doc.set(activeField, !(current ?? true));
      return doc.save() as Promise<T | null>;
    },

    remove: async (id: string) => {
      return Model.findByIdAndDelete(id).exec() as Promise<T | null>;
    },
  };
}
