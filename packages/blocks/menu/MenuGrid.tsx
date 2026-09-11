'use client';

import { useMemo, useState } from 'react';
import { useMenu, useStoreStatus } from '@saas/hooks';
import type { Category, Product } from '@saas/types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { CategoryFilter } from './CategoryFilter';
import { SearchBar } from './SearchBar';

export interface MenuGridData {
  products: Product[];
  categories: Category[];
  isOpen: boolean;
}

export interface MenuGridProps {
  columns?: 2 | 3 | 4;
  primaryColor?: string;
  variant?: 'horizontal' | 'vertical';
  /** Datos client-side para previews sin backend. Si viene, no usa el fetch de useMenu. */
  data?: MenuGridData;
}

const GRID_CLASS = {
  2: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  3: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
} as const;

/**
 * Grid de productos del menú. Consume useMenu + useStoreStatus directamente;
 * incluye filtro por categoría y búsqueda.
 */
export function MenuGrid({ columns = 3, variant = 'horizontal', data }: MenuGridProps) {
  const liveMenu = useMenu();
  const { isOpen: liveIsOpen } = useStoreStatus();

  // Cuando llega `data` (modo preview estático) el filtrado es local.
  const [localCategory, setLocalCategory] = useState<string | null>(null);
  const [localQuery, setLocalQuery] = useState('');

  const isLocal = data !== undefined;
  const products = isLocal ? data.products : liveMenu.products;
  const categories = isLocal ? data.categories : liveMenu.categories;
  const loading = isLocal ? false : liveMenu.loading;
  const isOpen = isLocal ? data.isOpen : liveIsOpen;
  const selectedCategory = isLocal ? localCategory : liveMenu.selectedCategory;
  const searchQuery = isLocal ? localQuery : liveMenu.searchQuery;

  const localFiltered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        (product.description ?? '').toLowerCase().includes(query);
      return product.available && matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const filteredProducts = isLocal ? localFiltered : liveMenu.filteredProducts;

  const selectCategory = (categoryId: string | null) => {
    if (isLocal) setLocalCategory(categoryId);
    else liveMenu.selectCategory(categoryId);
  };

  const setSearch = (query: string) => {
    if (isLocal) {
      setLocalQuery(query);
      if (query) setLocalCategory(null);
    } else {
      liveMenu.setSearch(query);
    }
  };

  if (loading) {
    return (
      <div className={GRID_CLASS[columns]} role="status" aria-label="Cargando menú">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {categories.length > 0 && (
        <div className="mb-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={selectCategory}
          />
        </div>
      )}

      <div className="mx-auto mb-6 mt-4 max-w-md px-4">
        <SearchBar searchQuery={searchQuery} onSearch={setSearch} placeholder="Buscar en el menú..." />
      </div>

      <div id="product-list-top" />

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-500">El menú está vacío por ahora.</p>
      ) : filteredProducts.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-500">
          No encontramos productos para tu búsqueda.
        </p>
      ) : (
        <div className={GRID_CLASS[columns]}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isStoreOpen={isOpen}
              variant={variant}
            />
          ))}
        </div>
      )}
    </div>
  );
}
