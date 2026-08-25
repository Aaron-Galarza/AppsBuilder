'use client'

import { HeroSection } from '@/components/sections/HeroSection'
import { CTASection } from '@/components/sections/CTASection'
import { ContactSection } from '@/components/sections/ContactSection'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection
        title="INJECT_HERO_TITLE"
        subtitle="INJECT_HERO_SUBTITLE"
        imageSrc="INJECT_HERO_IMAGE"
        primaryColor="INJECT_PRIMARY_COLOR"
        ctaText="INJECT_HERO_CTA_TEXT"
        ctaHref="#contact"
      />
      <CTASection
        title="INJECT_CTA_TITLE"
        subtitle="INJECT_CTA_SUBTITLE"
        buttonText="INJECT_CTA_BUTTON_TEXT"
        buttonHref="INJECT_CTA_BUTTON_HREF"
        buttonColor="INJECT_PRIMARY_COLOR"
      />
      <ContactSection
        title="INJECT_CONTACT_TITLE"
        subtitle="INJECT_CONTACT_SUBTITLE"
        phone="INJECT_CONTACT_PHONE"
        email="INJECT_CONTACT_EMAIL"
        address="INJECT_CONTACT_ADDRESS"
        whatsappNumber="INJECT_WHATSAPP_NUMBER"
        primaryColor="INJECT_PRIMARY_COLOR"
      />
    </main>
  )
}
