'use client'

import { MenuBrowser } from '@saas/blocks/menu'
import { StoreStatus, PromoBanner } from '@saas/blocks/layout'
import { useSiteConfig } from '@saas/hooks'
import { MiniHero } from '../components/sections/MiniHero'

export default function HomePage() {
  const cfg = useSiteConfig()
  const menu = cfg.textos?.['menu'] || {}

  return (
    <main className="flex min-h-screen flex-col pb-10">
      {/* BLOCK: layout — Banner promocional (config) */}
      <PromoBanner />

      {/* BLOCK: hero — Hero compacto */}
      <MiniHero />

      <div className="w-full">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4">
          {/* BLOCK: layout — Estado del local */}
          <StoreStatus variant="pill" />

          {/* BLOCK: menu — Título + búsqueda + categorías + listado */}
          <header className="pt-3 text-center">
            <p className="eyebrow">Menú</p>
            <h1 className="mt-2 font-heading text-2xl font-bold tracking-wide text-foreground sm:text-3xl">
              {menu['title'] || 'Nuestro Menú'}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {menu['description'] || 'Elegí tus favoritos y pedí en minutos.'}
            </p>
          </header>

          <MenuBrowser variant="list" placeholder="Buscar productos..." />
        </div>
      </div>
    </main>
  )
}
