'use client'

import { useMemo } from 'react'
import { AtSign, Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import { HeroSimple } from '@saas/blocks/hero'
import { AboutSimple } from '@saas/blocks/about'
import { CTASimple } from '@saas/blocks/cta'
import { ContactInfo } from '@saas/blocks/contact'
import { GalleryGrid } from '@saas/blocks/gallery'
import { TestimonialsCarousel } from '@saas/blocks/testimonials'
import { OfferBanner } from '@saas/blocks/offer'
import { NewsletterForm } from '@saas/blocks/newsletter'
import { useBuilderStore } from '../../stores/builderStore'
import type { BuilderState } from '../../stores/builderStore'
import { PRODUCT_BLOCKS } from '../constants'
import type { PreviewContext, ProductName, TemplateName } from './types'
import {
  buildPreviewTheme,
  resolvePreviewSrc,
  usePreviewFonts,
  usePreviewObjectUrls,
} from './theme'
import { WebOrdersPreview } from './runtime'

const t = (ctx: PreviewContext, block: string, key: string): string =>
  ctx.state.textos[block]?.[key] ?? ''

const primaryOf = (ctx: PreviewContext): string => ctx.state.config.colors.primary

/* ------------------------------------------------------------------ */
/* Shell del preview                                                   */
/* ------------------------------------------------------------------ */

export interface AppPreviewProps {
  /** Contenedor scrolleable del preview (lo usa el runtime de webOrders). */
  scrollRef?: { current: HTMLDivElement | null }
}

export function AppPreview({ scrollRef }: AppPreviewProps = {}) {
  const state = useBuilderStore()

  // webOrders: se renderiza la plantilla real (rutas + providers del runtime).
  if (state.product === 'webOrders') {
    return <WebOrdersPreview scrollRef={scrollRef} />
  }

  return <LandingSitePreview state={state} />
}

function LandingSitePreview({ state }: { state: BuilderState }) {
  const objectUrls = usePreviewObjectUrls(state.imagenes)

  const ctx: PreviewContext = useMemo(
    () => ({
      state,
      images: {
        logo: resolvePreviewSrc('logo', state, objectUrls),
        favicon: resolvePreviewSrc('favicon', state, objectUrls),
        hero: resolvePreviewSrc('hero', state, objectUrls),
        about: resolvePreviewSrc('about', state, objectUrls),
        offer: resolvePreviewSrc('offer', state, objectUrls),
      },
    }),
    [state, objectUrls]
  )

  usePreviewFonts(state)

  if (!state.product || !state.template) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <p className="text-center text-sm text-[#888]">
          Elegí un producto y una plantilla en el wizard para ver el preview.
        </p>
      </div>
    )
  }

  const theme = buildPreviewTheme(state)

  return (
    <div style={theme} className="min-h-screen w-full text-white">
      <PreviewHeader ctx={ctx} />
      <LandingBody ctx={ctx} />
      <PreviewFooter ctx={ctx} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Header / Footer (replicas de los layouts de landingPages)           */
/* ------------------------------------------------------------------ */

function PreviewHeader({ ctx }: { ctx: PreviewContext }) {
  const name = ctx.state.config.name || 'Tu negocio'
  const whatsapp = `https://wa.me/${t(ctx, 'contact', 'phone').replace(/\D/g, '')}`

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex flex-1 items-center justify-center gap-2 transition-opacity hover:opacity-80 min-w-0"
          aria-label="Ir al inicio"
        >
          {ctx.images.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ctx.images.logo}
              alt={name}
              width={32}
              height={32}
              className="h-8 w-8 object-contain shrink-0"
            />
          )}
          <span className="font-heading text-lg sm:text-xl font-bold tracking-wide text-primary truncate">
            {name}
          </span>
        </button>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white active:scale-95"
        >
          <MessageCircle size={18} strokeWidth={2} />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>
    </header>
  )
}

function PreviewFooter({ ctx }: { ctx: PreviewContext }) {
  const name = ctx.state.config.name || 'Tu negocio'
  const phone = t(ctx, 'contact', 'phone')
  const whatsapp = `https://wa.me/${phone.replace(/\D/g, '')}`

  return (
    <footer className="relative mt-20 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="bg-gradient-to-b from-card to-background border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl text-primary tracking-wider mb-2 font-heading font-semibold">
              {name}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-muted/50 to-transparent rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all flex flex-col items-center">
              <Clock className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-white text-sm mb-1">Horarios</h3>
              <p className="text-muted-foreground text-xs">Consultanos por WhatsApp</p>
            </div>
            <div className="bg-gradient-to-br from-muted/50 to-transparent rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all flex flex-col items-center">
              <MapPin className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-white text-sm mb-1">Dirección</h3>
              <p className="text-muted-foreground text-xs">Consultanos por WhatsApp</p>
            </div>
            <div className="bg-gradient-to-br from-muted/50 to-transparent rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all flex flex-col items-center">
              <Phone className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-white text-sm mb-1">WhatsApp</h3>
              <span className="text-primary text-xs">Consultanos</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/20">
            <div className="flex items-center gap-2.5">
              {ctx.images.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ctx.images.logo}
                  alt={name}
                  className="w-8 h-8 grayscale opacity-40 shrink-0 object-cover rounded-full"
                />
              )}
              <div className="text-left">
                <p className="text-[10px] font-extrabold text-white uppercase tracking-wider leading-tight">
                  {name}
                </p>
                <p className="text-[9px] font-medium text-muted-foreground">
                  &copy; {new Date().getFullYear()} Todos los derechos reservados
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-medium text-muted-foreground leading-tight">
                Desarrollado por
              </p>
              <a
                href="https://www.afdevelopers.com/"
                className="text-[10px] font-extrabold text-primary tracking-wide"
              >
                AFdevelopers
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* Landing pages: una seccion por bloque seleccionado                  */
/* ------------------------------------------------------------------ */

function LandingSection({ block, ctx }: { block: string; ctx: PreviewContext }) {
  const { state } = ctx
  const primary = primaryOf(ctx)

  switch (block) {
    case 'hero':
      return (
        <HeroSimple
          title={t(ctx, 'hero', 'title')}
          subtitle={t(ctx, 'hero', 'subtitle')}
          imageSrc={ctx.images.hero}
          primaryColor={primary}
          ctaText={t(ctx, 'hero', 'ctaText')}
          ctaHref="#about"
          isOpen={true}
        />
      )
    case 'about':
      return (
        <section id="about" className="scroll-mt-20">
          <AboutSimple
            title={t(ctx, 'about', 'title')}
            text={t(ctx, 'about', 'text')}
            imageSrc={ctx.images.about}
            primaryColor={primary}
          />
        </section>
      )
    case 'gallery':
      return (
        <section className="mx-auto w-full max-w-5xl px-4 py-16">
          <h2 className="mb-8 text-center font-heading text-3xl font-bold">
            {t(ctx, 'gallery', 'title')}
          </h2>
          <GalleryGrid images={[]} columns={3} />
        </section>
      )
    case 'testimonials':
      return (
        <section className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-16">
          <h2 className="mb-2 text-center font-heading text-3xl font-bold">
            {t(ctx, 'testimonials', 'title')}
          </h2>
          <p className="mb-8 text-center text-sm text-neutral-500">
            {t(ctx, 'testimonials', 'subtitle')}
          </p>
          <TestimonialsCarousel testimonials={[]} primaryColor={primary} />
        </section>
      )
    case 'offer':
      return (
        <section className="mx-auto w-full max-w-4xl scroll-mt-20 px-4 py-16">
          <h2 className="mb-2 text-center font-heading text-3xl font-bold">
            {t(ctx, 'offer', 'title')}
          </h2>
          <p className="mb-8 text-center text-sm text-neutral-500">
            {t(ctx, 'offer', 'subtitle')}
          </p>
          <OfferBanner
            title={t(ctx, 'offer', 'bannerTitle')}
            text={t(ctx, 'offer', 'bannerDescription')}
            badgeText={t(ctx, 'offer', 'discountText')}
            ctaText={t(ctx, 'offer', 'buttonText')}
            ctaHref="#contact"
            primaryColor={primary}
          />
        </section>
      )
    case 'cta':
      return (
        <CTASimple
          title={t(ctx, 'cta', 'title')}
          text={t(ctx, 'cta', 'subtitle')}
          ctaText={t(ctx, 'cta', 'buttonText')}
          ctaHref="#contact"
          primaryColor={primary}
        />
      )
    case 'contact':
      return (
        <section id="contact" className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-16">
          <div className="flex justify-center">
            <ContactInfo
              address={t(ctx, 'contact', 'address')}
              phone={t(ctx, 'contact', 'phone')}
              primaryColor={primary}
            />
          </div>
        </section>
      )
    case 'newsletter':
      return (
        <section className="mx-auto w-full max-w-2xl px-4 pb-20 text-center">
          <h2 className="mb-2 font-heading text-3xl font-bold">
            {t(ctx, 'newsletter', 'title')}
          </h2>
          <p className="mb-8 text-sm text-neutral-500">{t(ctx, 'newsletter', 'subtitle')}</p>
          <div className="flex justify-center">
            <NewsletterForm primaryColor={primary} />
          </div>
        </section>
      )
    default:
      return null
  }
}

function LandingBody({ ctx }: { ctx: PreviewContext }) {
  const product = ctx.state.product as ProductName
  const template = ctx.state.template as TemplateName
  const canonical = PRODUCT_BLOCKS[product]?.[template] ?? []
  const selected = canonical.filter((b) => ctx.state.selectedBlocks.includes(b))

  return (
    <main className="flex min-h-screen flex-col">
      {selected.map((block) => (
        <LandingSection key={block} block={block} ctx={ctx} />
      ))}
    </main>
  )
}