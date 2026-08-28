'use client'

import { MenuGrid } from '@saas/blocks/menu'

export function MenuSection() {
  return (
    <section id="product-list-top" className="mx-auto w-full max-w-2xl px-4 pb-14 pt-8">
      <MenuGrid primaryColor="INJECT_PRIMARY_COLOR" />
    </section>
  )
}