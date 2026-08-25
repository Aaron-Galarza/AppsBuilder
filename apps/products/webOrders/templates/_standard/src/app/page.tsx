'use client'

import { HeroSimple } from '@saas/blocks/hero'
import { MenuGrid, CategoryFilter } from '@saas/blocks/menu'
import { AboutSimple } from '@saas/blocks/about'
import { CTASimple } from '@saas/blocks/cta'
import { useMenu } from '@saas/hooks'

export default function HomePage() {
  const {
    categories,
    loading,
    error,
    selectedCategory,
    filteredProducts,
    selectCategory,
  } = useMenu()

  return (
    <main className="flex min-h-screen flex-col">
      <HeroSimple
        title="INJECT_HERO_TITLE"
        subtitle="INJECT_HERO_SUBTITLE"
        imageSrc="INJECT_HERO_IMAGE_URL"
        primaryColor="INJECT_PRIMARY_COLOR"
        ctaText="INJECT_HERO_CTA_TEXT"
        isOpen={true}
      />

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

      <section className="scroll-mt-20">
        <AboutSimple
          title="INJECT_ABOUT_TITLE"
          description="INJECT_ABOUT_DESCRIPTION"
          imageSrc="INJECT_ABOUT_IMAGE_URL"
          primaryColor="INJECT_PRIMARY_COLOR"
        />
      </section>

      <section className="scroll-mt-20">
        <CTASimple
          title="INJECT_CTA_TITLE"
          subtitle="INJECT_CTA_SUBTITLE"
          buttonText="INJECT_CTA_BUTTON_TEXT"
          buttonHref="#menu"
          buttonColor="INJECT_PRIMARY_COLOR"
        />
      </section>
    </main>
  )
}
