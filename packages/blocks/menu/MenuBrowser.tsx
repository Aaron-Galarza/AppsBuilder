'use client';

import { useMemo, useState } from 'react';
import { useCartStore, useMenu, useStoreStatus } from '@saas/hooks';
import type { Product } from '@saas/types';
import { AddonsModal } from './AddonsModal';
import { CategoryFilter } from './CategoryFilter';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { SearchBar } from './SearchBar';

export interface MenuBrowserProps {
  /** list: búsqueda + categorías sticky + listado horizontal agrupado (home basic). grid: búsqueda centrada + categorías + grilla vertical agrupada (página menú). */
  variant?: 'list' | 'grid';
  /** Columnas de la grilla (solo variant="grid"). */
  columns?: 2 | 3 | 4;
  primaryColor?: string;
  placeholder?: string;
}

const GRID_CLASS = {
  2: 'grid grid-cols-2 gap-3',
  3: 'grid grid-cols-2 gap-3 sm:grid-cols-3',
  4: 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4',
} as const;

/**
 * Navegador completo del menú: búsqueda, filtro de categorías, listado agrupado
 * por categoría (con contador) y modal de adicionales. Reemplaza el HTML de
 * menú duplicado en las plantillas basic (list) y premium/standard (grid).
 */
export function MenuBrowser({
  variant = 'grid',
  columns = 3,
  primaryColor,
  placeholder = 'Buscar...',
}: MenuBrowserProps) {
  const menu = useMenu();
  const { isOpen } = useStoreStatus();
  const addItem = useCartStore((s) => s.addItem);
  const [addonProduct, setAddonProduct] = useState<Product | null>(null);

  const {
    products,
    categories,
    loading,
    error,
    selectedCategory,
    searchQuery,
    filteredProducts,
    selectCategory,
    setSearch,
  } = menu;

  const groups = useMemo(() => {
    const nameById = new Map(categories.map((c) => [c._id, c.name]));
    const byName = new Map<string, Product[]>();
    for (const product of filteredProducts) {
      const key = nameById.get(product.category) ?? 'Otros';
      const list = byName.get(key);
      if (list) list.push(product);
      else byName.set(key, [product]);
    }
    const ordered = categories.map((c) => c.name).filter((name) => byName.has(name));
    const extra = [...byName.keys()].filter((name) => !ordered.includes(name));
    return [...ordered, ...extra].map((name) => ({ name, products: byName.get(name) ?? [] }));
  }, [filteredProducts, categories]);

  if (loading) {
    return variant === 'list' ? (
      <div className="flex flex-col gap-3" role="status" aria-label="Cargando menú">
        {Array.from({ length: 5 }).map((_, i) => (
          <ProductCardSkeleton key={i} variant="horizontal" />
        ))}
      </div>
    ) : (
      <div className={GRID_CLASS[columns]} role="status" aria-label="Cargando menú">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} variant="vertical" />
        ))}
      </div>
    );
  }

  const emptyText = searchQuery || selectedCategory
    ? 'No encontramos productos para tu búsqueda.'
    : 'El menú está vacío por ahora.';

  return (
    <div className={variant === 'list' ? 'flex flex-col gap-5' : undefined}>
      {variant === 'grid' ? (
        <div className="mx-auto mb-6 max-w-xl">
          <SearchBar searchQuery={searchQuery} onSearch={setSearch} placeholder={placeholder} />
        </div>
      ) : (
        <SearchBar searchQuery={searchQuery} onSearch={setSearch} placeholder={placeholder} />
      )}

      {categories.length > 0 && (
        <div
          className={
            variant === 'grid'
              ? 'mb-8 overflow-x-auto pb-1'
              : 'sticky top-16 z-30 -mx-4 bg-background/95 px-4 py-1 backdrop-blur-lg'
          }
        >
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={selectCategory}
            primaryColor={primaryColor}
          />
        </div>
      )}

      {variant === 'grid' && <div id="product-list-top" />}

      {variant === 'list' && error && products.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-card p-6 text-center">
          <p className="text-sm text-white/60">{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        variant === 'list' ? (
          <div className="rounded-2xl border border-white/10 bg-card p-8 text-center">
            <p className="text-sm font-semibold text-white/70">{emptyText}</p>
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-neutral-500">{emptyText}</p>
        )
      ) : variant === 'list' ? (
        <div id="product-list-top" className="flex scroll-mt-24 flex-col gap-8">
          {groups.map((group) => (
            <section key={group.name}>
              <div className="mb-3 flex items-baseline gap-2 px-1">
                <h2 className="text-sm font-black uppercase tracking-widest text-white">{group.name}</h2>
                <span className="text-xs font-semibold text-white/40">{group.products.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {group.products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isStoreOpen={isOpen}
                    variant="horizontal"
                    onOpenAddons={setAddonProduct}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <>
          {groups.map((group) => (
            <section key={group.name} className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-400">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary, #111)' }}
                />
                {group.name}
              </h2>
              <div className={GRID_CLASS[columns]}>
                {group.products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isStoreOpen={isOpen}
                    variant="vertical"
                    onOpenAddons={setAddonProduct}
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      <AddonsModal
        product={addonProduct}
        isOpen={addonProduct !== null}
        onClose={() => setAddonProduct(null)}
        onConfirm={(product, quantity, selectedAddons) => {
          addItem(product, quantity, selectedAddons);
          setAddonProduct(null);
        }}
      />
    </div>
  );
}