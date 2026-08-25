'use client';

import { useMenu, useStoreStatus } from '@saas/hooks';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { CategoryFilter } from './CategoryFilter';
import { SearchBar } from './SearchBar';

export interface MenuGridProps {
  columns?: 2 | 3 | 4;
  primaryColor?: string;
  variant?: 'horizontal' | 'vertical';
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
export function MenuGrid({ columns = 3, variant = 'horizontal' }: MenuGridProps) {
  const {
    products,
    categories,
    loading,
    selectedCategory,
    selectCategory,
    searchQuery,
    setSearch,
    filteredProducts,
  } = useMenu();
  const { isOpen } = useStoreStatus();

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
