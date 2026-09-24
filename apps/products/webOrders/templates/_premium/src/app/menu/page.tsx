'use client'

import { MenuBrowser } from '@saas/blocks/menu'
import { useSiteConfig } from '@saas/hooks'

export default function MenuPage() {
  const cfg = useSiteConfig()
  const menuTextos = cfg.textos?.['menu'] || {}

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">
      <h1 className="mb-6 text-center font-heading text-2xl font-bold tracking-wide text-white sm:text-3xl">
        {menuTextos['title'] ?? ''}
      </h1>

      {/* BLOCK: menu */}
      <MenuBrowser variant="grid" columns={4} placeholder="Buscar en el menú..." />
    </div>
  )
}
