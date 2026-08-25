'use client'

import { ContactInfo } from '@saas/blocks/contact'
import { MessageCircle } from 'lucide-react'

interface ContactSectionProps {
  title: string
  subtitle?: string
  phone?: string
  email?: string
  address?: string
  whatsappNumber?: string
  primaryColor?: string
}

export function ContactSection({ title, subtitle, phone, email, address, whatsappNumber, primaryColor }: ContactSectionProps) {
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, me interesa conocer más sobre sus servicios.')}`
    : undefined

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary tracking-wider mb-4">{title}</h2>
          {subtitle && <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-card border border-border rounded-2xl p-8">
            <ContactInfo
              phone={phone}
              email={email}
              address={address}
            />
          </div>

          {whatsappUrl && (
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="bg-card border border-border rounded-2xl p-8 w-full text-center">
                <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-heading font-semibold text-white mb-2">¿Tenés preguntas?</h3>
                <p className="text-muted-foreground text-sm mb-6">Contactanos directamente por WhatsApp y te respondemos al instante.</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: primaryColor, color: '#fff' }}
                >
                  <MessageCircle size={18} strokeWidth={2} />
                  Escribinos por WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
