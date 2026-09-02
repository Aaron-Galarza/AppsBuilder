'use client'

import { HeroSimple } from '@saas/blocks/hero'
import { useStoreStatus } from '@saas/hooks'
import { Clock, MapPin, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { isOpen } = useStoreStatus()
  const whatsapp = `https://wa.me/${'INJECT_CONTACT_PHONE'.replace(/\D/g, '')}`

  return (
    <main className="flex min-h-screen flex-col">
      {/* BLOCK: hero */}
      <HeroSimple
        title="INJECT_HERO_TITLE"
        subtitle="INJECT_HERO_SUBTITLE"
        imageSrc="INJECT_HERO_IMAGE_URL"
        primaryColor="var(--color-primary)"
        isOpen={isOpen}
        ctaText="VER MENÚ"
        ctaHref="/menu"
      />

      {/* BLOCK: about */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-black sm:text-3xl">INJECT_ABOUT_TITLE</h2>
            <span
              className="mt-2 block h-1 w-12 rounded-full"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-500">
              INJECT_ABOUT_TEXT
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
                <p className="text-sm font-semibold">INJECT_CONTACT_HOURS</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 shadow-sm">
              <MapPin size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
              <div>
                <p className="text-xs text-neutral-500">Dirección</p>
                <p className="text-sm font-semibold">INJECT_CONTACT_ADDRESS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCK: cta */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div
          className="flex flex-col items-center gap-4 rounded-3xl px-8 py-14 text-center text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <h2 className="text-2xl font-black sm:text-3xl">INJECT_CTA_TITLE</h2>
          <p className="max-w-md text-sm text-white/80">INJECT_CTA_SUBTITLE</p>
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
    </main>
  )
}
