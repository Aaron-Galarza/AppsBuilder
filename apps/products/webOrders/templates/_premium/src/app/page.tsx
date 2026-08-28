'use client'

import { HeroSection } from '@/components/sections/HeroSection'
import { MenuSection } from '@/components/sections/MenuSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { CTASection } from '@/components/sections/CTASection'
import { GallerySection } from '@/components/sections/GallerySection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { OfferSection } from '@/components/sections/OfferSection'
import { NewsletterSection } from '@/components/sections/NewsletterSection'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />

      <MenuSection />

      <AboutSection />

      <CTASection />

      <GallerySection />

      <TestimonialsSection />

      <OfferSection />

      <NewsletterSection />
    </main>
  )
}