'use client'

import { HeroSimple } from '@saas/blocks/hero'

export function HeroSection() {
  return (
    <HeroSimple
      title="INJECT_HERO_TITLE"
      subtitle="INJECT_HERO_SUBTITLE"
      imageSrc="INJECT_HERO_IMAGE"
      primaryColor="INJECT_PRIMARY_COLOR"
      ctaText="INJECT_HERO_CTA_TEXT"
      ctaHref="#product-list-top"
    />
  )
}
