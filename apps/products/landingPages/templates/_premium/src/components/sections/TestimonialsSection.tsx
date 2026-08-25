'use client'

import { TestimonialsCarousel } from '@saas/blocks/testimonials'

export function TestimonialsSection() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-heading font-bold text-center text-white mb-2">INJECT_TESTIMONIALS_TITLE</h2>
        <p className="text-white/50 text-center text-sm mb-10">INJECT_TESTIMONIALS_SUBTITLE</p>
        <TestimonialsCarousel
          testimonials={[]}
          primaryColor="INJECT_PRIMARY_COLOR"
        />
      </div>
    </section>
  )
}
