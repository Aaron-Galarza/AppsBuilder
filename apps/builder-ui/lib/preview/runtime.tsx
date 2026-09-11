'use client'

import { useEffect, useMemo } from 'react'
import type { ComponentType, ReactNode } from 'react'
import type { ProjectConfig } from '@saas/configs/base.config'
import {
  NextNavBridge,
  SiteNavProvider,
  SiteConfigProvider,
  setSitePathname,
  useSitePathname,
} from '@saas/hooks'
import { getEffectiveBlocks } from '../generator/cleaner'
import { useBuilderStore } from '../../stores/builderStore'
import {
  buildPreviewTheme,
  resolvePreviewSrc,
  usePreviewFonts,
  usePreviewObjectUrls,
} from './theme'

/* ------------------------------------------------------------------ */
/* Plantillas webOrders: imports estáticos desde apps/products.        */
/* Son EXACTAMENTE los archivos que el generator copia al .zip, así el */
/* preview es réplica pixel-perfect del sitio generado.                */
/* ------------------------------------------------------------------ */

import BasicHome from '../../../products/webOrders/templates/_basic/src/app/page'
import BasicCart from '../../../products/webOrders/templates/_basic/src/app/cart/page'
import BasicCheckout from '../../../products/webOrders/templates/_basic/src/app/checkout/page'
import BasicOrderConfirmation from '../../../products/webOrders/templates/_basic/src/app/order-confirmation/page'
import BasicLogin from '../../../products/webOrders/templates/_basic/src/app/login/page'
import BasicAdmin from '../../../products/webOrders/templates/_basic/src/app/admin/page'
import { PublicLayout as BasicPublicLayout } from '../../../products/webOrders/templates/_basic/src/components/layout/PublicLayout'

import StandardHome from '../../../products/webOrders/templates/_standard/src/app/page'
import StandardMenu from '../../../products/webOrders/templates/_standard/src/app/menu/page'
import StandardCart from '../../../products/webOrders/templates/_standard/src/app/cart/page'
import StandardCheckout from '../../../products/webOrders/templates/_standard/src/app/checkout/page'
import StandardOrderConfirmation from '../../../products/webOrders/templates/_standard/src/app/order-confirmation/page'
import StandardLogin from '../../../products/webOrders/templates/_standard/src/app/login/page'
import StandardAdmin from '../../../products/webOrders/templates/_standard/src/app/admin/page'
import { PublicLayout as StandardPublicLayout } from '../../../products/webOrders/templates/_standard/src/components/layout/PublicLayout'

import PremiumHome from '../../../products/webOrders/templates/_premium/src/app/page'
import PremiumMenu from '../../../products/webOrders/templates/_premium/src/app/menu/page'
import PremiumCart from '../../../products/webOrders/templates/_premium/src/app/cart/page'
import PremiumCheckout from '../../../products/webOrders/templates/_premium/src/app/checkout/page'
import PremiumOrderConfirmation from '../../../products/webOrders/templates/_premium/src/app/order-confirmation/page'
import PremiumLogin from '../../../products/webOrders/templates/_premium/src/app/login/page'
import PremiumAdmin from '../../../products/webOrders/templates/_premium/src/app/admin/page'
import { PublicLayout as PremiumPublicLayout } from '../../../products/webOrders/templates/_premium/src/components/layout/PublicLayout'

type PageComponent = ComponentType

interface TemplateSet {
  Home: PageComponent
  Menu?: PageComponent
  Cart: PageComponent
  Checkout: PageComponent
  OrderConfirmation: PageComponent
  Login: PageComponent
  Admin: PageComponent
  PublicLayout: ComponentType<{ children: ReactNode }>
}

const TEMPLATES: Record<TemplateName, TemplateSet> = {
  basic: {
    Home: BasicHome,
    Cart: BasicCart,
    Checkout: BasicCheckout,
    OrderConfirmation: BasicOrderConfirmation,
    Login: BasicLogin,
    Admin: BasicAdmin,
    PublicLayout: BasicPublicLayout,
  },
  standard: {
    Home: StandardHome,
    Menu: StandardMenu,
    Cart: StandardCart,
    Checkout: StandardCheckout,
    OrderConfirmation: StandardOrderConfirmation,
    Login: StandardLogin,
    Admin: StandardAdmin,
    PublicLayout: StandardPublicLayout,
  },
  premium: {
    Home: PremiumHome,
    Menu: PremiumMenu,
    Cart: PremiumCart,
    Checkout: PremiumCheckout,
    OrderConfirmation: PremiumOrderConfirmation,
    Login: PremiumLogin,
    Admin: PremiumAdmin,
    PublicLayout: PremiumPublicLayout,
  },
}

type TemplateName = 'basic' | 'standard' | 'premium'

/** Resuelve pathname → página de la plantilla (fallback: Home). */
function SiteRouter({ templates }: { templates: TemplateSet }) {
  const pathname = useSitePathname()
  const route = pathname.split('?')[0].split('#')[0]
  const { PublicLayout } = templates

  let Page = templates.Home
  if (route === '/menu' && templates.Menu) Page = templates.Menu
  else if (route === '/cart') Page = templates.Cart
  else if (route === '/checkout') Page = templates.Checkout
  else if (route === '/order-confirmation') Page = templates.OrderConfirmation
  else if (route === '/login') Page = templates.Login
  else if (route === '/admin') Page = templates.Admin

  return (
    <PublicLayout>
      <Page />
    </PublicLayout>
  )
}

export interface WebOrdersPreviewProps {
  /** Contenedor scrolleable del preview (se resetea al cambiar de ruta). */
  scrollRef?: { current: HTMLDivElement | null }
}

/**
 * Renderiza la plantilla webOrders seleccionada tal cual sale en el ZIP:
 * misma estructura de páginas (PublicLayout + rutas), mismos providers
 * (SiteConfigProvider con la config del builder, SiteNavProvider, NextNavBridge).
 */
export function WebOrdersPreview({ scrollRef }: WebOrdersPreviewProps) {
  const state = useBuilderStore()
  const objectUrls = usePreviewObjectUrls(state.imagenes)
  const pathname = useSitePathname()
  const template = state.template as TemplateName | null
  const templates = template ? TEMPLATES[template] : undefined

  usePreviewFonts(state)

  // Cambio de plantilla → volver a la home (cada template expone rutas distintas)
  useEffect(() => {
    if (template) setSitePathname('/')
  }, [template])

  // Cambio de ruta → scroll al inicio del contenido
  useEffect(() => {
    scrollRef?.current?.scrollTo({ top: 0 })
  }, [pathname, scrollRef])

  const config = useMemo<ProjectConfig | undefined>(() => {
    if (!state.product) return undefined
    const logo = resolvePreviewSrc('logo', state, objectUrls)
    const favicon = resolvePreviewSrc('favicon', state, objectUrls)
    const hero = resolvePreviewSrc('hero', state, objectUrls)
    const about = resolvePreviewSrc('about', state, objectUrls)
    const offer = resolvePreviewSrc('offer', state, objectUrls)
    return {
      name: state.config.name || 'Tu negocio',
      slug: state.config.slug || 'project',
      colors: state.config.colors,
      fonts: state.config.fonts,
      logo,
      favicon,
      textos: state.textos,
      images: { logo, favicon, hero, about, offer },
      blocks: [...getEffectiveBlocks(state.selectedBlocks, state.product)],
      whatsapp: '',
      instagram: '',
      address: '',
      mapboxToken: '',
      apiUrl: '',
    }
  }, [state, objectUrls])

  if (!state.product || !template || !templates || !config) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8 text-center">
        <p className="text-sm text-[#888]">
          Elegí un producto y una plantilla en el wizard para ver el preview.
        </p>
      </div>
    )
  }

  const theme = buildPreviewTheme(state)

  return (
    <SiteConfigProvider config={config}>
      <SiteNavProvider>
        <NextNavBridge />
        {/* Espejo del body del layout de las plantillas (flex column) */}
        <div style={theme} className="flex min-h-full flex-col antialiased">
          <SiteRouter templates={templates} />
        </div>
      </SiteNavProvider>
    </SiteConfigProvider>
  )
}