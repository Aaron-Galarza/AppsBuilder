'use client'

import { HeroSimple } from '@saas/blocks/hero'
import { AboutSimple } from '@saas/blocks/about'
import { CTASimple } from '@saas/blocks/cta'
import { ContactInfo } from '@saas/blocks/contact'

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
    </>
  )
}
