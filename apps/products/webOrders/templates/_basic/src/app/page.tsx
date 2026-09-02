'use client'

import { MiniHero } from '@/components/sections/MiniHero'
import { MenuSection } from '@/components/sections/MenuSection'
import { StatusBar } from '@/components/sections/StatusBar'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col pb-10">
      {/* BLOCK: hero — Hero compacto */}
      <MiniHero />

      <div className="w-full">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-4">
          {/* BLOCK: menu — Estado del local */}
          <StatusBar />

          {/* BLOCK: menu — Búsqueda + categorías + listado + adicionales */}
          <MenuSection />
        </div>
      </div>
    </main>
  )
}