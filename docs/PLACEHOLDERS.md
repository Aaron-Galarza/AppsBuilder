# Placeholders — Sistema de Inyección de AppsBuilder

Este documento define **todos** los strings placeholder que el generador reemplaza al crear un ZIP.

> **Regla**: Cada placeholder es un string literal exacto (case-sensitive).
> El generador busca y reemplaza estos strings en los archivos correspondientes.

---

## Por archivo

### `tailwind.config.ts`

| Placeholder | Descripción | Ejemplo |
|-------------|-------------|---------|
| `INJECT_PRIMARY_COLOR` | Color primario (botones, accents) | `#ff0000` |
| `INJECT_SECONDARY_COLOR` | Color secundario (backgrounds) | `#fff000` |
| `INJECT_ACCENT_COLOR` | Color accent (borders, dividers) | `#333333` |
| `INJECT_FONT_HEADING` | Fuente para títulos | `Poppins` |
| `INJECT_FONT_BODY` | Fuente para cuerpo de texto | `Inter` |

### `src/app/page.tsx` y componentes sections/

| Placeholder | Descripción | Ejemplo |
|-------------|-------------|---------|
| `INJECT_PROJECT_NAME` | Nombre del proyecto/cliente | `PizzaYa` |
| `INJECT_HERO_TITLE` | Título del hero | `Bienvenido a PizzaYa` |
| `INJECT_HERO_SUBTITLE` | Subtítulo del hero | `Las mejores pizzas de la ciudad` |
| `INJECT_HERO_CTA_TEXT` | Texto del botón CTA del hero | `Ver menú` |
| `INJECT_HERO_IMAGE_URL` | URL de imagen del hero | `https://res.cloudinary.com/.../hero.jpg` |
| `INJECT_ABOUT_TITLE` | Título sección About | `Nuestra Historia` |
| `INJECT_ABOUT_TEXT` | Descripción sección About | `Somos un pequeño restaurante...` |
| `INJECT_ABOUT_IMAGE_URL` | URL de imagen del About | `https://res.cloudinary.com/.../about.jpg` |
| `INJECT_CTA_TITLE` | Título sección CTA | `¿Listo para ordenar?` |
| `INJECT_CTA_SUBTITLE` | Subtítulo sección CTA | `Haz tu pedido ahora` |
| `INJECT_CTA_BUTTON_TEXT` | Texto del botón CTA | `Haz tu pedido aquí` |
| `INJECT_MENU_TITLE` | Título del menú | `Nuestro Menú` |
| `INJECT_MENU_DESCRIPTION` | Descripción del menú | `Variedad de sabores` |
| `INJECT_LOGO_URL` | URL del logo | `https://res.cloudinary.com/.../logo.png` |
| `INJECT_FAVICON_URL` | URL del favicon | `https://res.cloudinary.com/.../favicon.ico` |

### Placeholders premium (solo webOrders _premium y landingPages _premium)

| Placeholder | Descripción | Ejemplo |
|-------------|-------------|---------|
| `INJECT_GALLERY_TITLE` | Título sección Galería | `Nuestra Galería` |
| `INJECT_TESTIMONIALS_TITLE` | Título sección Testimonios | `Lo que dicen nuestros clientes` |
| `INJECT_OFFER_TITLE` | Título sección Ofertas | `Ofertas Especiales` |
| `INJECT_NEWSLETTER_TITLE` | Título sección Newsletter | `Suscribite a nuestro newsletter` |

### Placeholders landingPages (features y pricing)

| Placeholder | Descripción | Ejemplo |
|-------------|-------------|---------|
| `INJECT_FEATURES_TITLE` | Título sección Features | `Nuestras Características` |
| `INJECT_PRICING_TITLE` | Título sección Pricing | `Nuestros Planes` |
| `INJECT_PRICING_SUBTITLE` | Subtítulo sección Pricing | `Elegí el plan que mejor se adapte a vos` |

### `package.json`

| Placeholder | Descripción | Ejemplo |
|-------------|-------------|---------|
| `INJECT_PROJECT_NAME` | Nombre del proyecto (webOrders: `-web`, landingPages: `-landing`) | `pizzaya-web` |

### `.env.local`

| Placeholder | Descripción | Ejemplo |
|-------------|-------------|---------|
| `INJECT_API_URL` | URL del backend API | `https://pizzaya-backend.onrender.com/api` |
| `INJECT_TENANT_NAME` | Nombre del tenant/proyecto | `PizzaYa` |
| `INJECT_MAPBOX_TOKEN` | Token de Mapbox (solo webOrders con delivery) | `pk.xxx` |

### `packages/configs/{slug}.config.ts`

| Placeholder | Descripción | Ejemplo |
|-------------|-------------|---------|
| `INJECT_PROJECT_NAME` | Nombre del proyecto | `PizzaYa` |
| `INJECT_PROJECT_SLUG` | Slug del proyecto (kebab-case) | `pizzaya` |
| `INJECT_PRIMARY_COLOR` | Color primario | `#ff0000` |
| `INJECT_SECONDARY_COLOR` | Color secundario | `#fff000` |
| `INJECT_ACCENT_COLOR` | Color accent | `#333333` |
| `INJECT_FONT_HEADING` | Fuente títulos | `Poppins` |
| `INJECT_FONT_BODY` | Fuente cuerpo | `Inter` |
| `INJECT_LOGO_URL` | URL del logo | `https://res.cloudinary.com/.../logo.png` |
| `INJECT_FAVICON_URL` | URL del favicon | `https://res.cloudinary.com/.../favicon.ico` |
| `INJECT_MAPBOX_TOKEN` | Token Mapbox | `pk.xxx` |

### `sync-master.sh` (generado en el ZIP)

| Placeholder | Descripción | Ejemplo |
|-------------|-------------|---------|
| `INJECT_BLOCKS_SYNC` | Líneas git checkout de bloques seleccionados | `git checkout appsbuilder/main -- packages/blocks/hero/` |

---

## Resumen por producto

### webOrders (Basic/Standard/Premium)

| Placeholder | Basic | Standard | Premium |
|-------------|:-----:|:--------:|:-------:|
| INJECT_PRIMARY_COLOR | ✓ | ✓ | ✓ |
| INJECT_SECONDARY_COLOR | ✓ | ✓ | ✓ |
| INJECT_ACCENT_COLOR | ✓ | ✓ | ✓ |
| INJECT_FONT_HEADING | ✓ | ✓ | ✓ |
| INJECT_FONT_BODY | ✓ | ✓ | ✓ |
| INJECT_PROJECT_NAME | ✓ | ✓ | ✓ |
| INJECT_HERO_TITLE | - | ✓ | ✓ |
| INJECT_HERO_SUBTITLE | - | ✓ | ✓ |
| INJECT_HERO_CTA_TEXT | - | ✓ | ✓ |
| INJECT_HERO_IMAGE_URL | - | ✓ | ✓ |
| INJECT_ABOUT_TITLE | - | ✓ | ✓ |
| INJECT_ABOUT_TEXT | - | ✓ | ✓ |
| INJECT_ABOUT_IMAGE_URL | - | ✓ | ✓ |
| INJECT_CTA_TITLE | - | ✓ | ✓ |
| INJECT_CTA_SUBTITLE | - | ✓ | ✓ |
| INJECT_CTA_BUTTON_TEXT | - | ✓ | ✓ |
| INJECT_MENU_TITLE | ✓ | ✓ | ✓ |
| INJECT_MENU_DESCRIPTION | ✓ | ✓ | ✓ |
| INJECT_LOGO_URL | ✓ | ✓ | ✓ |
| INJECT_FAVICON_URL | ✓ | ✓ | ✓ |
| INJECT_API_URL | ✓ | ✓ | ✓ |
| INJECT_TENANT_NAME | ✓ | ✓ | ✓ |
| INJECT_MAPBOX_TOKEN | - | ✓ | ✓ |
| INJECT_GALLERY_TITLE | - | - | ✓ |
| INJECT_TESTIMONIALS_TITLE | - | - | ✓ |
| INJECT_OFFER_TITLE | - | - | ✓ |
| INJECT_NEWSLETTER_TITLE | - | - | ✓ |

### landingPages (Basic/Standard/Premium)

| Placeholder | Basic | Standard | Premium |
|-------------|:-----:|:--------:|:-------:|
| INJECT_PRIMARY_COLOR | ✓ | ✓ | ✓ |
| INJECT_SECONDARY_COLOR | ✓ | ✓ | ✓ |
| INJECT_ACCENT_COLOR | ✓ | ✓ | ✓ |
| INJECT_FONT_HEADING | ✓ | ✓ | ✓ |
| INJECT_FONT_BODY | ✓ | ✓ | ✓ |
| INJECT_PROJECT_NAME | ✓ | ✓ | ✓ |
| INJECT_HERO_TITLE | ✓ | ✓ | ✓ |
| INJECT_HERO_SUBTITLE | ✓ | ✓ | ✓ |
| INJECT_HERO_CTA_TEXT | ✓ | ✓ | ✓ |
| INJECT_HERO_IMAGE_URL | ✓ | ✓ | ✓ |
| INJECT_CTA_TITLE | ✓ | ✓ | ✓ |
| INJECT_CTA_SUBTITLE | ✓ | ✓ | ✓ |
| INJECT_CTA_BUTTON_TEXT | ✓ | ✓ | ✓ |
| INJECT_LOGO_URL | ✓ | ✓ | ✓ |
| INJECT_FAVICON_URL | ✓ | ✓ | ✓ |
| INJECT_FEATURES_TITLE | - | ✓ | ✓ |
| INJECT_PRICING_TITLE | - | ✓ | ✓ |
| INJECT_PRICING_SUBTITLE | - | ✓ | ✓ |
| INJECT_TESTIMONIALS_TITLE | - | - | ✓ |
| INJECT_NEWSLETTER_TITLE | - | - | ✓ |
