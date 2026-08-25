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
    <section id="menu" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-2xl px-4 pt-16 pb-6">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white text-center mb-2">
          INJECT_MENU_TITLE
        </h2>
        <p className="text-white/50 text-sm text-center mb-8">
          INJECT_MENU_SUBTITLE
        </p>
      </div>
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
    </section>
  )
}
