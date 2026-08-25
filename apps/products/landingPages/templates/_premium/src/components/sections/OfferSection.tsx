'use client'

import { OfferBanner } from '@saas/blocks/offer'

export function OfferSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-heading font-bold text-center text-white mb-2">INJECT_OFFER_TITLE</h2>
        <p className="text-white/50 text-center text-sm mb-10">INJECT_OFFER_SUBTITLE</p>
        <OfferBanner
          title="INJECT_OFFER_BANNER_TITLE"
          description="INJECT_OFFER_BANNER_DESCRIPTION"
          discountText="INJECT_OFFER_DISCOUNT_TEXT"
          buttonText="INJECT_OFFER_BUTTON_TEXT"
          buttonHref="#product-list-top"
          primaryColor="INJECT_PRIMARY_COLOR"
          backgroundImage="INJECT_OFFER_BACKGROUND_IMAGE"
        />
      </div>
    </section>
  )
}
