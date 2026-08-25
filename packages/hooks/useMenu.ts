'use client';

import { Category, Addon, Product } from '@saas/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from './lib/api';

const CACHE_KEY = 'saas-menu-cache';
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

/** Fusiona los adicionales disponibles dentro de cada producto según su categoría */
function mergeAddonsIntoProducts(products: Product[], addons: Addon[]): Product[] {
  return products.map((product) => ({
    ...product,
    addons: addons.filter(
      (addon) =>
        addon.available &&
        addon.categories.some((cat) => cat._id === product.category || cat.name === product.category)
    ),
  }));
}

export function useMenu() {
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
        apiFetch<Category[]>('/api/categories'),
        apiFetch<Addon[]>('/api/addons'),
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
  }, [fetchMenu]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const cache = readCache();
      if (!cache || Date.now() - cache.savedAt >= CACHE_TTL_MS) {
        void fetchMenu(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [fetchMenu]);

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
