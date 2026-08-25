# WebOrders — Templates

Templates para proyectos de menú digital con sistema de pedidos (delivery y retiro).

## Estructura

```
webOrders/templates/
├── _basic/       (18 archivos) — Menú + Carrito + Checkout + Confirmación
├── _standard/    (26 archivos) — _basic + Admin (6 tabs) + Hero + About + CTA
└── _premium/     (30 archivos) — _standard + Galería + Testimonios + Oferta + Newsletter
```

## Templates

### _basic (18 archivos)
- `src/app/page.tsx` — Menú con CategoryFilter + MenuGrid
- `src/app/cart/page.tsx` — Carrito de compras
- `src/app/checkout/page.tsx` — Formulario de checkout completo
- `src/app/order-confirmation/page.tsx` — Confirmación de pedido
- `src/components/layout/Header.tsx` — Header con logo + carrito
- `src/components/layout/Footer.tsx` — Footer con info del local
- `src/components/layout/PublicLayout.tsx` — Layout público

### _standard (26 archivos)
- Todo lo de _basic +
- `src/app/admin/page.tsx` — Panel admin con 6 tabs (overview, orders, menu, coupons, gallery, config)
- `src/app/login/page.tsx` — Login de administrador
- `src/components/sections/HeroSection.tsx` — Sección hero
- `src/components/sections/MenuSection.tsx` — Sección menú
- `src/components/sections/AboutSection.tsx` — Sección "Sobre nosotros"
- `src/components/sections/CTASection.tsx` — Call to action

### _premium (30 archivos)
- Todo lo de _standard +
- `src/components/sections/GallerySection.tsx` — Galería de fotos
- `src/components/sections/TestimonialsSection.tsx` — Testimonios
- `src/components/sections/OfferSection.tsx` — Banner de ofertas
- `src/components/sections/NewsletterSection.tsx` — Formulario newsletter

## Configuración de colores

Los colores se inyectan vía CSS variables en `globals.css` y `tailwind.config.ts`:

```css
@theme {
  --color-primary: INJECT_PRIMARY_COLOR;
  --color-secondary: INJECT_SECONDARY_COLOR;
  --color-accent: INJECT_ACCENT_COLOR;
}
```

## Dependencias

- `@saas/blocks` — Bloques UI (Hero, Menu, Cart, Checkout, Admin, etc)
- `@saas/hooks` — Hooks (useMenu, useCart, useAuth, etc)
- `@saas/types` — Tipos TypeScript
- `@saas/ui` — Componentes base
- `@saas/utils` — Utilidades (formatPrice, etc)
- `next` ^16.3.2
- `react` 19.2.4
- `zustand` ^5.0.14

## Deploy

Los templates se generan como ZIP vía AppsBuilder. Una vez descargado:

```bash
cd {proyecto}-weborder
pnpm install
pnpm dev
```
