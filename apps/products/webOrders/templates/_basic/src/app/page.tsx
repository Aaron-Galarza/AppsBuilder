'use client'

import { MenuBrowser } from '@saas/blocks/menu'
import { StoreStatus, PromoBanner } from '@saas/blocks/layout'
import { MiniHero } from '../components/sections/MiniHero'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col pb-10">
      {/* BLOCK: layout — Banner promocional (config) */}
      <PromoBanner />

      {/* BLOCK: hero — Hero compacto */}
      <MiniHero />

      <div className="w-full">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-4">
          {/* BLOCK: layout — Estado del local */}
          <StoreStatus variant="pill" />

          {/* BLOCK: menu — Búsqueda + categorías + listado + adicionales */}
          <MenuBrowser variant="list" placeholder="Buscar productos..." />
        </div>
      </div>
    </main>
  )
}
