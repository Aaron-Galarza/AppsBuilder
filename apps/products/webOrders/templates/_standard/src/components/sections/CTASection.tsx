'use client'

import { CTASimple } from '@saas/blocks/cta'

export function CTASection() {
  return (
    <section className="scroll-mt-20">
      <CTASimple
        title="INJECT_CTA_TITLE"
        subtitle="INJECT_CTA_SUBTITLE"
        buttonText="INJECT_CTA_BUTTON_TEXT"
        buttonHref="#menu"
        buttonColor="INJECT_PRIMARY_COLOR"
      />
    </section>
  )
}
