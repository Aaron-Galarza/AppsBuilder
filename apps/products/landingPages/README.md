# LandingPages — Templates

Templates para landing pages institucionales y de captación de clientes.

## Estructura

```
landingPages/templates/
├── _basic/       (16 archivos) — Hero + CTA + Contacto
├── _standard/    (20 archivos) — _basic + Admin (3 tabs) + About + Menu Preview
└── _premium/     (24 archivos) — _standard + Galería + Testimonios + Oferta + Newsletter
```

## Templates

### _basic (16 archivos)
- `src/app/page.tsx` — Hero + CTA + Contacto
- `src/components/layout/Header.tsx` — Header con logo + WhatsApp CTA
- `src/components/layout/Footer.tsx` — Footer con info
- `src/components/layout/PublicLayout.tsx` — Layout público
- `src/components/sections/HeroSection.tsx` — Sección hero
- `src/components/sections/CTASection.tsx` — Call to action (WhatsApp)
- `src/components/sections/ContactSection.tsx` — Info de contacto

### _standard (20 archivos)
- Todo lo de _basic +
- `src/app/admin/page.tsx` — Panel admin con 3 tabs (overview, menu, config)
- `src/app/login/page.tsx` — Login de administrador
- `src/components/sections/AboutSection.tsx` — Sección "Sobre nosotros"
- `src/components/sections/MenuPreviewSection.tsx` — Preview del menú

### _premium (24 archivos)
- Todo lo de _standard +
- `src/components/sections/GallerySection.tsx` — Galería de fotos
- `src/components/sections/TestimonialsSection.tsx` — Testimonios
- `src/components/sections/OfferSection.tsx` — Banner de ofertas
- `src/components/sections/NewsletterSection.tsx` — Formulario newsletter

## Diferencias con webOrders

- **Sin carrito/checkout** — Las landing pages no tienen sistema de pedidos
- **CTA por WhatsApp** — En vez de botón de carrito, usan enlace a WhatsApp
- **Admin simplificado** — Menos tabs (sin orders, coupons)
- **Hero prominente** — Sección hero con CTA de WhatsApp

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

- `@saas/blocks` — Bloques UI (Hero, About, CTA, Contact, Gallery, etc)
- `@saas/hooks` — Hooks (useMenu, useAuth, etc)
- `@saas/types` — Tipos TypeScript
- `@saas/ui` — Componentes base
- `@saas/utils` — Utilidades
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
