'use client'

import { MenuGrid, CategoryFilter } from '@saas/blocks/menu'
import { useMenu } from '@saas/hooks'

export function MenuPreviewSection() {
  const {
    categories,
    loading,
    error,
    selectedCategory,
    filteredProducts,
    selectCategory,
  } = useMenu()

  return (
    <>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={selectCategory}
      />
      <section id="product-list-top" className="mx-auto w-full max-w-2xl px-4 pb-14 pt-8">
        <h2 className="text-3xl font-heading font-bold text-center text-white mb-2">INJECT_MENU_TITLE</h2>
        <p className="text-white/50 text-center text-sm mb-10">INJECT_MENU_SUBTITLE</p>
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
