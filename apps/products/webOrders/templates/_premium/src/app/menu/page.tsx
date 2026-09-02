'use client'

import { useMemo, useState } from 'react'
import {
  SearchBar,
  CategoryFilter,
  ProductCard,
  ProductCardSkeleton,
  AddonsModal,
} from '@saas/blocks/menu'
import { useMenu, useCartStore, useStoreStatus } from '@saas/hooks'
import type { Product } from '@saas/types'

const GRID_CLASS = 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'

export default function MenuPage() {
  const { products, categories, loading, selectedCategory, selectCategory, searchQuery, setSearch, filteredProducts } =
    useMenu()
  const { isOpen } = useStoreStatus()
  const addItem = useCartStore((s) => s.addItem)
  const [addonProduct, setAddonProduct] = useState<Product | null>(null)

  const handleOpenAddons = (product: Product) => setAddonProduct(product)

  const grouped = useMemo(() => {
    const nameById = new Map(categories.map((c) => [c._id, c.name]))
    const map = new Map<string, Product[]>()
    for (const p of filteredProducts) {
      const catName = nameById.get(p.category) || 'Otros'
      const list = map.get(catName) ?? []
      list.push(p)
      map.set(catName, list)
    }
    return Array.from(map.entries())
  }, [filteredProducts, categories])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">
      <h1 className="mb-6 text-center font-heading text-2xl font-bold tracking-wide text-white sm:text-3xl">
        NUESTRO MENÚ
      </h1>

      <div className="mx-auto mb-6 max-w-xl">
        {/* BLOCK: menu */}
        <SearchBar searchQuery={searchQuery} onSearch={setSearch} placeholder="Buscar en el menú..." />
      </div>

      {categories.length > 0 && (
        <div className="mb-8 overflow-x-auto pb-1">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={selectCategory}
          />
        </div>
      )}

      <div id="product-list-top" />

      {loading ? (
        <div className={GRID_CLASS} role="status" aria-label="Cargando menú">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} variant="vertical" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-500">El menú está vacío por ahora.</p>
      ) : filteredProducts.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-500">No encontramos productos para tu búsqueda.</p>
      ) : (
        grouped.map(([categoryName, items]) => (
          <section key={categoryName} className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {categoryName}
            </h2>
            <div className={GRID_CLASS}>
              {items.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isStoreOpen={isOpen}
                  variant="vertical"
                  onOpenAddons={handleOpenAddons}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {/* BLOCK: menu */}
      <AddonsModal
        product={addonProduct}
        isOpen={addonProduct !== null}
        onClose={() => setAddonProduct(null)}
        onConfirm={(product, quantity, selectedAddons) => {
          addItem(product, quantity, selectedAddons)
          setAddonProduct(null)
        }}
      />
    </div>
  )
}
