# WebOrders — Templates

Producto "menú digital con pedidos" del generador de AppsBuilder: delivery y retiro, carrito, checkout,
orden de confirmación, login y panel admin.

> Los templates son **aplicaciones Next.js finas que importan bloques de `@saas/blocks`**. No hay secciones
> duplicadas por plantilla: la diferencia entre `_basic` / `_standard` / `_premium` es qué bloques compone
> el `page.tsx` (gated por `cfg.blocks`) y el `level` del `AdminApp`. Un ZIP generado solo incluye los bloques
> seleccionados (ver `cleaner.ts` en `apps/builder-ui/lib/generator`).

## Estructura

```
webOrders/templates/
├── _basic/       — home compacta (MenuBrowser + MiniHero + StoreStatus + PromoBanner)
├── _standard/    — home con Hero + About + CTA + PromoBanner; menú en /menu
└── _premium/     — _standard + Bloques de marketing (galería, testimonios, ofertas, newsletter)
```

Cada template (plantilla `package.json`): Next.js ^16, React ^19, Tailwind 4, Zustand; deps locales
`src/components/layout/PublicLayout.tsx`, `src/components/sections/MiniHero.tsx` (solo basic),
`src/styles/globals.css` y `tailwind.config.ts` con placeholders `INJECT_*` que el generador reemplaza.

## Rutas (cada template)

| Ruta | Contenido |
|---|---|
| `/` (home) | `cfg.blocks` decide las secciones (hero/about/cta/…); siempre `PromoBanner` + `StoreStatus` |
| `/menu` | menú completo (standard/premium; en basic el menú vive en la home) |
| `/cart` | carrito (`useCartStore` + bloques `@saas/blocks/cart`) |
| `/checkout` | `CheckoutForm` + delivery + cupón + resumen (`@saas/blocks/checkout`) |
| `/order-confirmation` | confirmación post-pedido |
| `/login` | `LoginPage` (`@saas/blocks/auth`) |
| `/admin` | `AdminApp level="basic|standard|premium"` (`@saas/blocks/admin`) |

El ZIP de `webOrders` incluye además `apps/backend` y `apps/web-admin` copiados del master (ver ARCHITECTURE §6).

## Deploy

El template se genera como ZIP vía AppsBuilder. Una vez descargado:

```bash
cd <slug>-web          # apps/products/webOrders/templates/<t>
pnpm install
pnpm dev
```

Web/admin → Vercel; backend → Render. Ver `docs/GETTING_STARTED.md` (post-descarga) del repo master.