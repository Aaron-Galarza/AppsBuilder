'use client'

import { CTASimple } from '@saas/blocks/cta'

interface CTASectionProps {
  title: string
  subtitle?: string
  buttonText: string
  buttonHref?: string
  buttonColor?: string
}

export function CTASection({ title, subtitle, buttonText, buttonHref, buttonColor }: CTASectionProps) {
  return (
    <section id="cta">
      <CTASimple
        title={title}
        subtitle={subtitle}
        buttonText={buttonText}
        buttonHref={buttonHref}
        buttonColor={buttonColor}
      />
    </section>
  )
}
