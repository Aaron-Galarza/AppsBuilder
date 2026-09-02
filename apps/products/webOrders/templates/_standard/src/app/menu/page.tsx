'use client'

import { MenuGrid } from '@saas/blocks/menu'

export default function MenuPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black sm:text-3xl">INJECT_MENU_TITLE</h1>
        <p className="mt-2 text-sm text-neutral-500">INJECT_MENU_SUBTITLE</p>
      </header>

      {/* BLOCK: menu */}
      <MenuGrid columns={3} variant="vertical" />
    </main>
  )
}
