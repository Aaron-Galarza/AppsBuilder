'use client'

import { HeroSimple } from '@saas/blocks/hero'
import { PromoBanner } from '@saas/blocks/layout'
import { useStoreStatus, useSiteConfig } from '@saas/hooks'
import { Clock, MapPin, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const cfg = useSiteConfig()
  const { isOpen } = useStoreStatus()
  const hero = cfg.textos?.['hero'] || {}
  const about = cfg.textos?.['about'] || {}
  const contact = cfg.textos?.['contact'] || {}
  const cta = cfg.textos?.['cta'] || {}
  const whatsapp = `https://wa.me/${(contact['phone'] ?? '').replace(/\D/g, '')}`

  return (
    <main className="flex min-h-screen flex-col">
      <PromoBanner />

      {cfg.blocks?.includes('hero') && (
        <>
          {/* BLOCK: hero */}
          <HeroSimple
            title={hero['title'] ?? ''}
            subtitle={hero['subtitle'] ?? ''}
            imageSrc={cfg.images?.hero ?? ''}
            primaryColor="var(--color-primary)"
            isOpen={isOpen}
            ctaText="VER MENÚ"
            ctaHref="/menu"
          />
        </>
      )}

      {cfg.blocks?.includes('about') && (
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-black sm:text-3xl">{about['title'] ?? ''}</h2>
              <span
                className="mt-2 block h-1 w-12 rounded-full"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-500">
                {about['text'] ?? ''}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition hover:shadow"
                style={{ color: 'var(--color-primary)' }}
              >
                <MessageCircle size={18} />
                Enviar WhatsApp
              </a>
              <div className="flex items-start gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                <Clock size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p className="text-xs text-neutral-500">Horario de atención</p>
                  <p className="text-sm font-semibold">{contact['hours'] ?? ''}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                <MapPin size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p className="text-xs text-neutral-500">Dirección</p>
                  <p className="text-sm font-semibold">{contact['address'] ?? ''}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {cfg.blocks?.includes('cta') && (
        <>
          {/* BLOCK: cta */}
          <section className="mx-auto w-full max-w-5xl px-6 pb-16">
            <div
              className="flex flex-col items-center gap-4 rounded-3xl px-8 py-14 text-center text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <h2 className="text-2xl font-black sm:text-3xl">{cta['title'] ?? ''}</h2>
              <p className="max-w-md text-sm text-white/80">{cta['subtitle'] ?? ''}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/menu"
                  className="rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-wide transition hover:scale-105 active:scale-95"
                  style={{ color: 'var(--color-primary)' }}
                >
                  VER MENÚ
                </Link>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border-2 border-white/70 bg-transparent px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
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