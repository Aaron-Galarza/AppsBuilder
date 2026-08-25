'use client'

import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { MenuPreviewSection } from '@/components/sections/MenuPreviewSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { OfferSection } from '@/components/sections/OfferSection'
import { CTASection } from '@/components/sections/CTASection'
import { ContactSection } from '@/components/sections/ContactSection'
import { NewsletterSection } from '@/components/sections/NewsletterSection'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      <AboutSection />
      <MenuPreviewSection />
      <GallerySection />
      <TestimonialsSection />
      <OfferSection />
      <CTASection />
      <ContactSection />
      <NewsletterSection />
    </main>
  )
}
