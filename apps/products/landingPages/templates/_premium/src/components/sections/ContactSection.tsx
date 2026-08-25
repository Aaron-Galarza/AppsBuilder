'use client'

import { ContactInfo } from '@saas/blocks/contact'

export function ContactSection() {
  return (
    <section id="contact" className="py-16 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-heading font-bold text-center text-white mb-2">INJECT_CONTACT_TITLE</h2>
        <p className="text-white/50 text-center text-sm mb-10">INJECT_CONTACT_SUBTITLE</p>
        <div className="flex justify-center">
          <ContactInfo
            address="INJECT_CONTACT_ADDRESS"
            phone="INJECT_CONTACT_PHONE"
            email="INJECT_CONTACT_EMAIL"
            primaryColor="INJECT_PRIMARY_COLOR"
          />
        </div>
      </div>
    </section>
  )
}
