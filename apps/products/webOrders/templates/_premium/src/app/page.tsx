'use client'

import { HeroSimple } from '@saas/blocks/hero'
import { MenuGrid, CategoryFilter } from '@saas/blocks/menu'
import { AboutSimple } from '@saas/blocks/about'
import { CTASimple } from '@saas/blocks/cta'
import { GalleryGrid } from '@saas/blocks/gallery'
import { TestimonialsCarousel } from '@saas/blocks/testimonials'
import { OfferBanner } from '@saas/blocks/offer'
import { NewsletterForm } from '@saas/blocks/newsletter'
import { useMenu } from '@saas/hooks'
import { HeroSection } from '@/components/sections/HeroSection'
import { MenuSection } from '@/components/sections/MenuSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { CTASection } from '@/components/sections/CTASection'
import { GallerySection } from '@/components/sections/GallerySection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { OfferSection } from '@/components/sections/OfferSection'
import { NewsletterSection } from '@/components/sections/NewsletterSection'

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
      <HeroSection />

      <MenuSection
        categories={categories}
        loading={loading}
        error={error}
        selectedCategory={selectedCategory}
        filteredProducts={filteredProducts}
        selectCategory={selectCategory}
      />

      <AboutSection />

      <CTASection />

      <GallerySection />

      <TestimonialsSection />

      <OfferSection />

      <NewsletterSection />
    </main>
  )
}
