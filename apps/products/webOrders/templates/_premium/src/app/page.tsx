'use client'

import { StatusBar } from '@/components/sections/StatusBar'
import { HeroWithCarousel } from '@saas/blocks/hero'
import { AboutWithStory } from '@saas/blocks/about'
import { MapPin, MessageCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const mapsEmbed = `https://maps.google.com/maps?q=${encodeURIComponent('INJECT_CONTACT_ADDRESS')}&z=15&output=embed`
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('INJECT_CONTACT_ADDRESS')}`
  const whatsapp = `https://wa.me/${'INJECT_CONTACT_PHONE'.replace(/\D/g, '')}`

  return (
    <main className="flex min-h-screen flex-col">
      <StatusBar />

      {/* BLOCK: hero */}
      <HeroWithCarousel
        slides={[
          {
            title: 'INJECT_HERO_TITLE',
            text: 'INJECT_HERO_SUBTITLE',
            image: 'INJECT_HERO_IMAGE_URL',
            cta: 'VER MÁS',
            ctaHref: '/menu',
          },
        ]}
        autoPlayMs={6000}
      />

      {/* BLOCK: about */}
      <AboutWithStory
        title="INJECT_ABOUT_TITLE"
        story="INJECT_ABOUT_TEXT"
        primaryColor="var(--color-primary)"
        stats={[
          { value: '100%', label: 'Calidad' },
          { value: '24/7', label: 'Soporte' },
          { value: '5★', label: 'Valoración' },
        ]}
      />

      {/* BLOCK: about */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-black sm:text-2xl text-white">Contáctanos</h3>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                style={{ color: 'var(--color-primary)' }}
              >
                <MessageCircle size={18} />
                Enviar WhatsApp (Pedidos)
              </a>
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Horario de atención</p>
                  <p className="text-sm font-semibold text-white">INJECT_CONTACT_HOURS</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Dirección</p>
                  <p className="text-sm font-semibold text-white">INJECT_CONTACT_ADDRESS</p>
                  <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline underline-offset-2">
                    Ver en Mapa
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <iframe
              title="Mapa de INJECT_TENANT_NAME"
              src={mapsEmbed}
              width="100%"
              height="100%"
              style={{ minHeight: '260px', border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-primary px-4 py-3 text-center text-sm font-bold text-black transition hover:opacity-90"
            >
              ABRIR EN MAPS
            </a>
          </div>
        </div>
      </section>

      {/* BLOCK: cta */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-10">
        <div
          className="flex flex-col items-center gap-4 rounded-3xl px-8 py-14 text-center text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <h2 className="text-2xl font-black sm:text-3xl">INJECT_CTA_TITLE</h2>
          <p className="max-w-md text-sm text-white/80">INJECT_CTA_SUBTITLE</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/menu"
              className="rounded-full border-2 border-white bg-transparent px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
            >
              VER MENÚ
            </Link>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-white bg-transparent px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
            >
              WHATSAPP
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
