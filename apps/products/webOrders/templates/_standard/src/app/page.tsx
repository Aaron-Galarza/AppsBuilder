'use client'

import { HeroSection } from '@/components/sections/HeroSection'
import { MenuSection } from '@/components/sections/MenuSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { CTASection } from '@/components/sections/CTASection'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />

      <MenuSection />

      <AboutSection />

      <CTASection />
    </main>
  )
}