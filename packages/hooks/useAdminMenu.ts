'use client';

import { Addon, Category, Product } from '@saas/types';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, authHeaders } from './lib/api';
import { useAdminCrud } from './useAdminCrud';
import { useAuthStore } from './useAuthStore';

interface MenuData {
  products: Product[];
  categories: Category[];
  addons: Addon[];
}

/**
 * Carga paralela del menú completo (admin) + tres ABM listos para usar
 * (productos, categorías y adicionales).
 */
export function useAdminMenu() {
  const token = useAuthStore((s) => s.token);

  const [data, setData] = useState<MenuData>({ products: [], categories: [], addons: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const [products, categories, addons] = await Promise.all([
        apiFetch<Product[]>('/api/products/admin', { headers: authHeaders(token) }),
        apiFetch<Category[]>('/api/categories/admin', { headers: authHeaders(token) }),
        apiFetch<Addon[]>('/api/addons/admin', { headers: authHeaders(token) }),
      ]);
      setData({ products, categories, addons });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const products = useAdminCrud<{ [key: string]: unknown }, Product>({
    blank: () => ({ title: '', price: 0, category: '', image: '' }),
    fromItem: (p) => ({
      title: p.title,
      price: p.price,
      category: p.category,
      image: p.image ?? '',
      description: p.description ?? '',
      available: p.available,
      featured: p.featured,
      order: p.order,
      addons: (p.addons ?? []).map((a) => a._id),
    }),
    toPayload: (form) => form,
    create: async (form) => {
      await apiFetch('/api/products/admin', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(form),
      });
    },
    update: async (id, form) => {
      await apiFetch(`/api/products/admin/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(form),
      });
    },
    toggle: async (id) => {
      await apiFetch(`/api/products/admin/toggleActive/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
      });
    },
    remove: async (id) => {
      await apiFetch(`/api/products/admin/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
    },
    reload,
  });

  const categories = useAdminCrud<{ [key: string]: unknown }, Category>({
    blank: () => ({ name: '', icon: 'utensils' }),
    fromItem: (c) => ({ name: c.name, icon: c.icon ?? 'utensils' }),
    toPayload: (form) => form,
    create: async (form) => {
      await apiFetch('/api/categories/admin', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(form),
      });
    },
    update: async (id, form) => {
      await apiFetch(`/api/categories/admin/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(form),
      });
    },
    toggle: undefined,
    remove: async (id) => {
      await apiFetch(`/api/categories/admin/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
    },
    reload,
  });

  const addons = useAdminCrud<{ [key: string]: unknown }, Addon>({
    blank: () => ({ name: '', price: 0 }),
    fromItem: (a) => ({
      name: a.name,
      price: a.price,
      available: a.available,
      categories: a.categories.map((c) => c._id),
    }),
    toPayload: (form) => form,
    create: async (form) => {
      await apiFetch('/api/addons/admin', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(form),
      });
    },
    update: async (id, form) => {
      await apiFetch(`/api/addons/admin/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(form),
      });
    },
    toggle: async (id) => {
      await apiFetch(`/api/addons/admin/toggleActive/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
      });
    },
    remove: async (id) => {
      await apiFetch(`/api/addons/admin/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
    },
    reload,
  });

  return {
    /** Listas crudas del menú: { products, categories, addons } */
    items: data,
    loading,
    error,
    reload,
    products,
    categories,
    addons,
  };
}
