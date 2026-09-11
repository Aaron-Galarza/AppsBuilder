'use client'

import { MenuGrid } from '@saas/blocks/menu'
import { useSiteConfig } from '@saas/hooks'

export default function MenuPage() {
  const cfg = useSiteConfig()
  const menuTextos = cfg.textos?.['menu'] || {}

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black sm:text-3xl">{menuTextos['title'] ?? 'NUESTRO MENÚ'}</h1>
        <p className="mt-2 text-sm text-neutral-500">{menuTextos['description'] ?? ''}</p>
      </header>

      {/* BLOCK: menu */}
      <MenuGrid columns={3} variant="vertical" />
    </main>
  )
}