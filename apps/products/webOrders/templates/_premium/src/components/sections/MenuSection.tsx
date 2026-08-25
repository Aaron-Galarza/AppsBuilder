'use client'

import { MenuGrid, CategoryFilter } from '@saas/blocks/menu'

interface MenuSectionProps {
  categories: any[]
  loading: boolean
  error: string | null
  selectedCategory: string | null
  filteredProducts: any[]
  selectCategory: (id: string | null) => void
}

export function MenuSection({ categories, loading, error, selectedCategory, filteredProducts, selectCategory }: MenuSectionProps) {
  return (
    <>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={selectCategory}
      />
      <section id="product-list-top" className="mx-auto w-full max-w-2xl px-4 pb-14 pt-8">
        <MenuGrid
          products={filteredProducts}
          loading={loading}
          error={error}
          isStoreOpen={true}
          categories={categories}
          selectedCategory={selectedCategory}
          primaryColor="INJECT_PRIMARY_COLOR"
          onRetry={() => window.location.reload()}
        />
      </section>
    </>
  )
}
