'use client';

import { Category, Addon, Product } from '@saas/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from './lib/api';

const CACHE_KEY = 'saas-menu-cache-v3';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

interface MenuCache {
  savedAt: number;
  products: Product[];
  categories: Category[];
  addons: Addon[];
}

function readCache(): MenuCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MenuCache;
  } catch {
    return null;
  }
}

function writeCache(cache: MenuCache): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage lleno o bloqueado: se ignora
  }
}

/**
 * Normaliza una categoría del addon que puede venir poblada ({_id, name})
 * o como ObjectId suelto (GET /api/addons/public no hace populate).
 */
function matchesAddonCategory(category: Category, productCategory: string): boolean {
  if (!category) return false;
  if (typeof category === 'object') {
    return category._id === productCategory || category.name === productCategory;
  }
  return String(category) === productCategory;
}

/**
 * Fusiona los adicionales disponibles dentro de cada producto. Un producto puede
 * tener adicionales por dos vías y se toman ambos:
 *  - explícita: `product.addons` con IDs de adicionales (la API pública los manda
 *    sin populate, como strings);
 *  - por categoría: el adicional tiene asignada la categoría del producto
 *    (`addon.categories` con la categoría de menú).
 */
function mergeAddonsIntoProducts(products: Product[], addons: Addon[]): Product[] {
  const available = addons.filter((addon) => addon.available);
  return products.map((product) => {
    const rawAddons = (product.addons ?? []) as unknown as Array<string | { _id: string }>;
    const explicitIds = new Set(
      rawAddons.map((a) => (typeof a === 'string' ? a : a?._id)).filter(Boolean)
    );
    const matched = available.filter(
      (addon) =>
        explicitIds.has(addon._id) ||
        (addon.categories ?? []).some((cat) => matchesAddonCategory(cat, product.category))
    );
    return { ...product, addons: matched };
  });
}

export interface UseMenuOptions {
  /**
   * Permite montar el hook sin disparar fetch, para cuando el estado ya se pasa
   * controlado por props (así la página y MenuBrowser no piden el menú dos veces).
   */
  enabled?: boolean;
}

export function useMenu(options?: UseMenuOptions) {
  const enabled = options?.enabled ?? true;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQueryState] = useState('');

  const fetchMenu = useCallback(async (silent: boolean) => {
    if (!silent) setLoading(true);

    try {
      const [productsData, categoriesData, addonsData] = await Promise.all([
        apiFetch<Product[]>('/api/products/public'),
        apiFetch<Category[]>('/api/categories/public'),
        apiFetch<Addon[]>('/api/addons/public'),
      ]);

      const withAddons = mergeAddonsIntoProducts(productsData, addonsData);
      setProducts(withAddons);
      setCategories(categoriesData);
      setError(null);
      writeCache({ savedAt: Date.now(), products: withAddons, categories: categoriesData, addons: addonsData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const cache = readCache();
    if (cache && Date.now() - cache.savedAt < CACHE_TTL_MS) {
      // Cache fresca: mostrar al instante y refetch silencioso en background
      setProducts(cache.products);
      setCategories(cache.categories);
      setLoading(false);
      void fetchMenu(true);
    } else {
      void fetchMenu(false);
    }
  }, [enabled, fetchMenu]);

  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const cache = readCache();
      if (!cache || Date.now() - cache.savedAt >= CACHE_TTL_MS) {
        void fetchMenu(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [enabled, fetchMenu]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        (product.description ?? '').toLowerCase().includes(query);
      return matchesCategory && matchesSearch && product.available;
    });
  }, [products, selectedCategory, searchQuery]);

  const selectCategory = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  const setSearch = useCallback((query: string) => {
    setSearchQueryState(query);
    if (query) setSelectedCategory(null);
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    selectedCategory,
    searchQuery,
    filteredProducts,
    selectCategory,
    setSearch,
  };
}

/** Estado completo del menú: se puede pasar por props a MenuBrowser para controlarlo desde la página. */
export type MenuState = ReturnType<typeof useMenu>;
