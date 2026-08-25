'use client'

import { ContactSection as ContactBlock } from '@saas/blocks/contact'

export function ContactSection() {
  return (
    <section className="scroll-mt-20">
      <ContactBlock
        title="INJECT_CONTACT_TITLE"
        subtitle="INJECT_CONTACT_SUBTITLE"
        phone="INJECT_CONTACT_PHONE"
        email="INJECT_CONTACT_EMAIL"
        address="INJECT_CONTACT_ADDRESS"
        whatsapp="INJECT_WHATSAPP_NUMBER"
        primaryColor="INJECT_PRIMARY_COLOR"
      />
    </section>
  )
}
