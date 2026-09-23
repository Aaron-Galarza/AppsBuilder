# LandingPages — Templates

Producto "landing page institucional" del generador de AppsBuilder: single-page con secciones estáticas,
CTA por WhatsApp y **sin sistema de pedidos** (no hay carrito, backend ni admin en el ZIP).

> Los templates son aplicaciones Next.js finas que componen `@saas/blocks` directamente en `src/app/page.tsx`.
> `_basic` / `_standard` / `_premium` difieren solo en qué bloques se incluyen (gated por `cfg.blocks`).

## Estructura

```
landingPages/templates/
├── _basic/       — Hero + CTA + Contact
├── _standard/    — _basic + About + Features/Pricing
└── _premium/     — _standard + Gallery + Testimonials + Offer + Newsletter
```

Cada template: Next.js ^16, React ^19, Tailwind 4; `src/components/layout/PublicLayout.tsx` (Header/Footer),
`src/styles/globals.css` y `tailwind.config.ts` con placeholders `INJECT_*`.

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | single-page: secciones según `cfg.blocks` (hero → about → gallery → testimonials → offer → cta → contact → newsletter) |

Los textos/imágenes vienen de `clientConfig` (`useSiteConfig`) o de `INJECT_*` resueltos por el generador.

## Diferencias con webOrders

- **Sin carrito/checkout/confirmación** — no hay sistema de pedidos.
- **CTA por WhatsApp** — botones de acción que arman `https://wa.me/<teléfono>`.
- **Sin backend ni admin** — el ZIP contiene solo `packages/*` + el template (`PRODUCT_APPS.landingPages = []`).

## Deploy

```bash
cd <slug>-landing     # apps/products/landingPages/templates/<t>
pnpm install
pnpm dev
```

→ Vercel. Ver `docs/GETTING_STARTED.md` (post-descarga) del repo master.