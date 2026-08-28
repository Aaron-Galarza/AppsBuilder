'use client'

import { NewsletterForm } from '@saas/blocks/newsletter'

export function NewsletterSection() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-heading font-bold text-white mb-2">INJECT_NEWSLETTER_TITLE</h2>
        <p className="text-white/50 text-sm mb-8">INJECT_NEWSLETTER_SUBTITLE</p>
        <NewsletterForm
          primaryColor="INJECT_PRIMARY_COLOR"
        />
      </div>
    </section>
  )
}
