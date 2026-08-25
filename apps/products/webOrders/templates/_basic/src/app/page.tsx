'use client'

import { MenuGrid, CategoryFilter } from '@saas/blocks/menu'
import { useMenu } from '@saas/hooks'

export default function HomePage() {
  const {
    categories,
    loading,
    error,
    selectedCategory,
    filteredProducts,
    selectCategory,
    setSearch,
    searchQuery,
  } = useMenu()

  return (
    <main className="flex min-h-screen flex-col">
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
    </main>
  )
}
