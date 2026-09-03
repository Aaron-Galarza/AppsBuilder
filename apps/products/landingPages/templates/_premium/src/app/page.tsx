'use client'

import { HeroSimple } from '@saas/blocks/hero'
import { AboutSimple } from '@saas/blocks/about'
import { GalleryGrid } from '@saas/blocks/gallery'
import { TestimonialsCarousel } from '@saas/blocks/testimonials'
import { OfferBanner } from '@saas/blocks/offer'
import { CTASimple } from '@saas/blocks/cta'
import { ContactInfo } from '@saas/blocks/contact'
import { NewsletterForm } from '@saas/blocks/newsletter'

export default function HomePage() {
  return (
    <>
      {/* BLOCK: hero */}
      <HeroSimple
        title="INJECT_HERO_TITLE"
        subtitle="INJECT_HERO_SUBTITLE"
        imageSrc="INJECT_HERO_IMAGE_URL"
        primaryColor="INJECT_PRIMARY_COLOR"
        ctaText="INJECT_HERO_CTA_TEXT"
        ctaHref="#about"
        isOpen={true}
      />

      {/* BLOCK: about */}
      <section id="about" className="scroll-mt-20">
        <AboutSimple
          title="INJECT_ABOUT_TITLE"
          text="INJECT_ABOUT_TEXT"
          imageSrc="INJECT_ABOUT_IMAGE_URL"
          primaryColor="INJECT_PRIMARY_COLOR"
        />
      </section>

      {/* BLOCK: gallery */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center font-heading text-3xl font-bold">INJECT_GALLERY_TITLE</h2>
        <GalleryGrid images={[]} columns={3} />
      </section>

      {/* BLOCK: testimonials */}
      <section className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-16">
        <h2 className="mb-2 text-center font-heading text-3xl font-bold">INJECT_TESTIMONIALS_TITLE</h2>
        <p className="mb-8 text-center text-sm text-neutral-500">INJECT_TESTIMONIALS_SUBTITLE</p>
        <TestimonialsCarousel testimonials={[]} primaryColor="INJECT_PRIMARY_COLOR" />
      </section>

      {/* BLOCK: offer */}
      <section className="mx-auto w-full max-w-4xl scroll-mt-20 px-4 py-16">
        <h2 className="mb-2 text-center font-heading text-3xl font-bold">INJECT_OFFER_TITLE</h2>
        <p className="mb-8 text-center text-sm text-neutral-500">INJECT_OFFER_SUBTITLE</p>
        <OfferBanner
          title="INJECT_OFFER_BANNER_TITLE"
          text="INJECT_OFFER_BANNER_DESCRIPTION"
          badgeText="INJECT_OFFER_DISCOUNT_TEXT"
          ctaText="INJECT_OFFER_BUTTON_TEXT"
          ctaHref="#contact"
          primaryColor="INJECT_PRIMARY_COLOR"
        />
      </section>

      {/* BLOCK: cta */}
      <CTASimple
        title="INJECT_CTA_TITLE"
        text="INJECT_CTA_SUBTITLE"
        ctaText="INJECT_CTA_BUTTON_TEXT"
        ctaHref="#contact"
        primaryColor="INJECT_PRIMARY_COLOR"
      />

      {/* BLOCK: contact */}
      <section id="contact" className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-16">
        <div className="flex justify-center">
          <ContactInfo
            address="INJECT_CONTACT_ADDRESS"
            phone="INJECT_CONTACT_PHONE"
            primaryColor="INJECT_PRIMARY_COLOR"
          />
        </div>
      </section>

      {/* BLOCK: newsletter */}
      <section className="mx-auto w-full max-w-2xl px-4 pb-20 text-center">
        <h2 className="mb-2 font-heading text-3xl font-bold">INJECT_NEWSLETTER_TITLE</h2>
        <p className="mb-8 text-sm text-neutral-500">INJECT_NEWSLETTER_SUBTITLE</p>
        <div className="flex justify-center">
          <NewsletterForm primaryColor="INJECT_PRIMARY_COLOR" />
        </div>
      </section>
    </>
  )
}
