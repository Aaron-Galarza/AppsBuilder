'use client'

import { useMemo, useState } from 'react'
import { AddonsModal, CategoryFilter, ProductCard, ProductCardSkeleton, SearchBar } from '@saas/blocks/menu'
import { useCartStore, useMenu, useStoreStatus } from '@saas/hooks'
import type { Product } from '@saas/types'

export function MenuSection() {
  const menu = useMenu()
  const { isOpen } = useStoreStatus()
  const addItem = useCartStore((s) => s.addItem)
  const [addonsProduct, setAddonsProduct] = useState<Product | null>(null)

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
  } = menu

  const groups = useMemo(() => {
    const nameById = new Map(categories.map((c) => [c._id, c.name]))
    const byName = new Map<string, Product[]>()
    for (const product of filteredProducts) {
      const key = nameById.get(product.category) ?? 'Otros'
      const list = byName.get(key)
      if (list) list.push(product)
      else byName.set(key, [product])
    }
    const ordered = categories.map((c) => c.name).filter((name) => byName.has(name))
    const extra = [...byName.keys()].filter((name) => !ordered.includes(name))
    return [...ordered, ...extra].map((name) => ({ name, products: byName.get(name) ?? [] }))
  }, [filteredProducts, categories])

  return (
    <div className="flex flex-col gap-5">
      {/* BLOCK: menu — Búsqueda de productos */}
      <SearchBar searchQuery={searchQuery} onSearch={setSearch} placeholder="Buscar productos..." />

      {/* BLOCK: menu — Filtro de categorías (sticky bajo el header) */}
      {categories.length > 0 && (
        <div className="sticky top-16 z-30 -mx-4 bg-background/95 px-4 py-1 backdrop-blur-lg">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(id) => {
              selectCategory(id)
              document.getElementById('product-list-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ProductCardSkeleton key={i} variant="horizontal" />
          ))}
        </div>
      ) : error && products.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-card p-6 text-center">
          <p className="text-sm text-white/60">{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-card p-8 text-center">
          <p className="text-sm font-semibold text-white/70">
            {searchQuery || selectedCategory
              ? 'No encontramos productos para tu búsqueda.'
              : 'El menú está vacío por ahora.'}
          </p>
        </div>
      ) : (
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
                    onOpenAddons={setAddonsProduct}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* BLOCK: menu — Modal de adicionales */}
      <AddonsModal
        product={addonsProduct}
        isOpen={addonsProduct !== null}
        onClose={() => setAddonsProduct(null)}
        onConfirm={(product, quantity, selectedAddons) => {
          addItem(product, quantity, selectedAddons)
          setAddonsProduct(null)
        }}
      />
    </div>
  )
}