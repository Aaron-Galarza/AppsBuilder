'use client'

import { CategoryFilter, MenuBrowser } from '@saas/blocks/menu'
import { useMenu, useSiteConfig } from '@saas/hooks'
import { HomeHero } from '../components/sections/HomeHero'

export default function HomePage() {
  const cfg = useSiteConfig()
  const menu = useMenu()
  const menuTexts = cfg.textos?.['menu'] || {}

  return (
    <main className="flex min-h-screen flex-col pb-10">
      {/* BLOCK: hero — banner de fondo + logo/nombre/estado + buscador */}
      <HomeHero menu={menu} />

      {/* BLOCK: menu — Franja de categorías pegada al hero */}
      {menu.categories.length > 0 && (
        <CategoryFilter
          categories={menu.categories}
          selectedCategory={menu.selectedCategory}
          onSelectCategory={menu.selectCategory}
          primaryColor="var(--color-primary)"
          variant="tabs"
        />
      )}

      <div className="w-full pt-4">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4">
          <header className="pt-3 text-center">
            <p className="eyebrow">Menú</p>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-wide text-foreground sm:text-3xl">
              {menuTexts['title'] || 'Nuestro Menú'}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {menuTexts['description'] || 'Elegí tus favoritos y pedí en minutos.'}
            </p>
          </header>

          {/* BLOCK: menu — Listado agrupado por categoría (búsqueda y categorías ya están arriba) */}
          <MenuBrowser variant="list" menu={menu} showSearch={false} showCategories={false} />
        </div>
      </div>
    </main>
  )
}
