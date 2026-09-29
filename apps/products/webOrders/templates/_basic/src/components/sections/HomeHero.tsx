'use client'

import { FeaturedBanner } from '@saas/blocks/menu'
import { useMenu, useSiteConfig, useStoreStatus } from '@saas/hooks'
import type { MenuState } from '@saas/hooks'

/**
 * Hero del home de Basic: la imagen de banner (admin) ocupa todo el ancho y arriba
 * se montan logo, nombre, subtítulo, estado abierto/cerrado y el buscador del menú.
 * Sin banner configurado el fondo queda negro.
 */
export function HomeHero({ menu }: { menu: MenuState }) {
  const cfg = useSiteConfig()
  const { isOpen, loading, bannerUrl } = useStoreStatus()
  const hero = cfg.textos?.['hero'] || {}

  return (
    <FeaturedBanner
      bannerUrl={bannerUrl}
      logo={cfg.logo}
      name={cfg.name}
      subtitle={hero['subtitle'] || hero['title']}
      isOpen={isOpen}
      loading={loading}
      searchQuery={menu.searchQuery}
      onSearch={menu.setSearch}
      placeholder="Buscar productos..."
    />
  )
}
