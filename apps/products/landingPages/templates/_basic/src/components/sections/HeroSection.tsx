'use client'

import { HeroSimple } from '@saas/blocks/hero'

interface HeroSectionProps {
  title: string
  subtitle?: string
  imageSrc: string
  primaryColor: string
  ctaText: string
  ctaHref?: string
}

export function HeroSection({ title, subtitle, imageSrc, primaryColor, ctaText, ctaHref }: HeroSectionProps) {
  return (
    <section id="hero">
      <HeroSimple
        title={title}
        subtitle={subtitle}
        imageSrc={imageSrc}
        primaryColor={primaryColor}
        ctaText={ctaText}
        ctaHref={ctaHref}
      />
    </section>
  )
}
