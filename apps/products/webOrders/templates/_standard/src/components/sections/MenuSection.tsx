'use client'

import { MenuGrid } from '@saas/blocks/menu'

export function MenuSection() {
  return (
    <section id="menu" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-2xl px-4 pt-16 pb-6">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white text-center mb-2">
          INJECT_MENU_TITLE
        </h2>
        <p className="text-white/50 text-sm text-center mb-8">
          INJECT_MENU_SUBTITLE
        </p>
      </div>
      <section id="product-list-top" className="mx-auto w-full max-w-2xl px-4 pb-14 pt-8">
        <MenuGrid primaryColor="INJECT_PRIMARY_COLOR" />
      </section>
    </section>
  )
}