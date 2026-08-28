'use client'

import { CTASimple } from '@saas/blocks/cta'

export function CTASection() {
  return (
    <section className="scroll-mt-20">
      <CTASimple
        title="INJECT_CTA_TITLE"
        text="INJECT_CTA_SUBTITLE"
        ctaText="INJECT_CTA_BUTTON_TEXT"
        ctaHref="#menu"
        primaryColor="INJECT_PRIMARY_COLOR"
      />
    </section>
  )
}
