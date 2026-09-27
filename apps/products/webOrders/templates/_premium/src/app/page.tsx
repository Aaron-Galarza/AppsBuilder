'use client'

import { StoreStatus, PromoBanner } from '@saas/blocks/layout'
import { HeroWithCarousel } from '@saas/blocks/hero'
import { AboutWithStory } from '@saas/blocks/about'
import { GalleryGrid } from '@saas/blocks/gallery'
import { OfferBanner } from '@saas/blocks/offer'
import { MapPin, MessageCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { useSiteConfig } from '@saas/hooks'

export default function HomePage() {
  const cfg = useSiteConfig()
  const contact = cfg.textos?.['contact'] || {}
  const hero = cfg.textos?.['hero'] || {}
  const about = cfg.textos?.['about'] || {}
  const cta = cfg.textos?.['cta'] || {}
  const gallery = cfg.textos?.['gallery'] || {}
  const offer = cfg.textos?.['offer'] || {}

  const mapsEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(contact['address'] ?? '')}&z=15&output=embed`
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact['address'] ?? '')}`
  const whatsapp = `https://wa.me/${(contact['phone'] ?? '').replace(/\D/g, '')}`

  return (
    <main className="flex min-h-screen flex-col">
      <PromoBanner />

      <StoreStatus variant="bar" />

      {cfg.blocks?.includes('hero') && (
        <>
          {/* BLOCK: hero */}
          <HeroWithCarousel
            slides={[
              {
                title: hero['title'] ?? '',
                text: hero['subtitle'] ?? '',
                image: cfg.images?.hero ?? '',
                cta: hero['ctaText'] || 'VER MÁS',
                ctaHref: '/menu',
              },
            ]}
            autoPlayMs={6000}
          />
        </>
      )}

      {cfg.blocks?.includes('about') && (
        <>
          {/* BLOCK: about */}
          <AboutWithStory
            title={about['title'] ?? ''}
            story={about['text'] ?? ''}
            imageSrc={cfg.images?.about}
            primaryColor="var(--color-primary)"
          />
        </>
      )}

      {cfg.blocks?.includes('gallery') && (
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="eyebrow text-center">Galería</p>
          <h2 className="mb-8 mt-2 text-center font-heading text-3xl font-bold tracking-tight">{gallery['title'] ?? ''}</h2>
          {/* BLOCK: gallery */}
          <GalleryGrid
            images={(cfg.images?.gallery ?? []).map((url) => ({ url }))}
            columns={3}
          />
        </section>
      )}

      {cfg.blocks?.includes('offer') && (
        <section className="mx-auto w-full max-w-4xl px-6 pb-4">
          <p className="eyebrow text-center">Oferta de la semana</p>
          <h2 className="mb-2 mt-2 text-center font-heading text-3xl font-bold tracking-tight">{offer['title'] ?? ''}</h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">{offer['subtitle'] ?? ''}</p>
          {/* BLOCK: offer */}
          <OfferBanner
            title={offer['bannerTitle'] ?? ''}
            text={offer['bannerDescription'] ?? ''}
            badgeText={offer['discountText'] ?? ''}
            ctaText={offer['buttonText'] ?? ''}
            ctaHref="/menu"
            primaryColor="var(--color-primary)"
            imageSrc={cfg.images?.offer}
          />
        </section>
      )}

      {cfg.blocks?.includes('contact') && (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="eyebrow">Contáctanos</p>
              <h3 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">{cfg.name}</h3>
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/80"
                >
                  <MessageCircle size={18} className="text-primary" />
                  Enviar WhatsApp (Pedidos)
                </a>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3">
                  <Clock size={18} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Horario de atención</p>
                    <p className="text-sm font-semibold text-foreground">{contact['hours'] ?? ''}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dirección</p>
                    <p className="text-sm font-semibold text-foreground">{contact['address'] ?? ''}</p>
                    <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline underline-offset-2">
                      Ver en Mapa
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-muted">
              <iframe
                title={`Mapa de ${cfg.name}`}
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
      )}

      {cfg.blocks?.includes('cta') && (
        <>
          {/* BLOCK: cta */}
          <section className="mx-auto w-full max-w-5xl px-6 pb-10">
            <div
              className="flex flex-col items-center gap-4 rounded-3xl px-8 py-14 text-center text-black"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">{cta['title'] ?? ''}</h2>
              <p className="max-w-md text-sm text-black/75">{cta['subtitle'] ?? ''}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/menu"
                  className="rounded-full bg-black px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:scale-105 active:scale-95"
                >
                  {cta['buttonText'] || 'VER MENÚ'}
                </Link>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border-2 border-black/60 bg-transparent px-7 py-3 text-sm font-bold uppercase tracking-wide text-black transition hover:bg-black hover:text-white"
                >
                  WHATSAPP
                </a>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  )
}