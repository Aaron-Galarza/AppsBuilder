'use client'

import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { MenuPreviewSection } from '@/components/sections/MenuPreviewSection'
import { CTASection } from '@/components/sections/CTASection'
import { ContactSection } from '@/components/sections/ContactSection'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />

      <AboutSection />

      <MenuPreviewSection />

      <CTASection />

      <ContactSection />
    </main>
  )
}
