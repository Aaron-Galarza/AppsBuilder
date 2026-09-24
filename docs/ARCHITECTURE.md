# AppsBuilder — Arquitectura

> Referencia única y actualizada del repositorio. Si algo cambia, actualiza ESTE archivo.
> Repo: monorepo pnpm + Turborepo en `C:\Users\Aaron\Desktop\OTROS\SECRETO\AppsBuilder` (branch `main`).
> Complementario: `docs/GETTING_STARTED.md` (levantar servicios + wizard + seed).

## 1. Qué es

AppsBuilder es una herramienta interna que genera **repositorios cliente listos para deployar** a partir de un
wizard web: elegís producto + plantilla + bloques, seteás colores/fuentes/textos/imágenes y bajás un `.zip`
con un monorepo completo (frontend + admin + backend según producto).

Ejemplo de proyecto generado: monorepo tipo `pizzaya-weborder/` con backend Express + MongoDB + JWT + Socket.io
(Render) y web/admin Next.js (Vercel).

### Roles del repo

| Rol | App/Dir | Puerto |
|---|---|---|
| Herramienta generadora | `apps/builder-ui` (Next 15 Pages Router) | 3001 |
| Panel admin base (cliente) | `apps/web-admin` (Next 15 App Router) | 3002 |
| Backend Express base (cliente) | `apps/backend` | 4000 |
| Código compartido | `packages/*` (`@saas/ui|blocks|hooks|types|utils|configs`) | — |
| Templates por producto | `apps/products/{webOrders,landingPages}/templates/_*` | — |

No hay "mock": backend y admin viven de una MongoDB real (Atlas o local). Sin DB, el backend arranca pero
`/health` reporta `db: down` y los endpoints dan 503.

## 2. Modelo de generación

```
master (este repo)                builder (apps/builder-ui)            cliente (ZIP)
─────────────────────────         ───────────────────────────         ─────────────────
packages/*  ─────────────┐        POST /api/generate-repo              monorepo generado:
apps/products/*/templates·┼──────►  readMasterFiles  (lee archivos      packages/* (recortados)
apps/backend, web-admin   │          locales, sin .env ni node_modules) apps/products/<producto>/templates/<t> (inyectado)
packages/blocks/<sel>  ───┘        cleanUnusedBlocks (borra lo no       apps/backend + apps/web-admin (solo webOrders)
                                   seleccionado + limpia imports/JSX)   pnpm-workspace.yaml, package.json
                                   uploadAllImages (Cloudinary)         README.md, sync-master.sh
                                   injectConfig (INJECT_*)              packages/configs/site.config.ts
                                   renameEnvFiles (.env.local.example → .env.local)
                                   generateSiteConfig → createZip ──►   client.git: sync-master.sh
```

El cliente final sincroniza sus `packages/*` contra el master de AppsBuilder con el `sync-master.sh` que viene
dentro del ZIP (`git checkout <remote>/main -- packages/*`).

## 3. Monorepo — estructura real

```
AppsBuilder/
├─ package.json / pnpm-workspace.yaml / turbo.json
├─ tsconfig.base.json
├─ .gitignore                  # NO versiona .env*, llaves, credenciales*, logs/, .next, node_modules
├─ AGENTS.md                   # reglas de trabajo (leer siempre)
├─ README.md
├─ scripts/
│  ├─ appsbuilder.ps1           # comando único: prerequisitos + install si falta + levanta servicios + monitoreo en vivo
│  ├─ install-command.ps1       # agrega la raíz al PATH del usuario -> comando global `appsbuilder`
│  ├─ start.ps1                 # wrapper -> appsbuilder.ps1
│  └─ stop.ps1                  # mata los 3 por puerto
├─ docs/
│  ├─ ARCHITECTURE.md          # (este archivo)
│  └─ GETTING_STARTED.md       # arranque, wizard, seed
├─ packages/
│  ├─ ui/        # componentes atómicos base
│  ├─ utils/     # cn, formatPrice, isValidHex, timezone (argWeekday, isArgNowBetween)...
│  ├─ types/     # tipos compartidos
│  ├─ configs/   # ProjectConfig, featureFlags, site.config (clientConfig generado)
│  ├─ hooks/     # stores + hooks de clientes + runtime de sitio
│  └─ blocks/    # bloques por dominio (ver §7)
├─ apps/
│  ├─ builder-ui/              # la herramienta (wizard + generador)
│  ├─ backend/                 # Express base (copia del cliente) con seed
│  ├─ web-admin/               # panel admin base (cliente)
│  └─ products/
│     ├─ webOrders/            # producto "menú + pedidos" (backend + admin en el ZIP)
│     │  └─ templates/{_basic,_standard,_premium}/
│     └─ landingPages/         # producto "landing estética" (solo front, sin backend/admin)
│        └─ templates/{_basic,_standard,_premium}/
```

## 4. Builder UI (`apps/builder-ui`)

Next.js 15 **Pages Router**, React 18, Tailwind 4, Zustand, React Hook Form + Zod.

### Wizard — 7 pasos

| Paso | Label | Contenido |
|---|---|---|
| `/builder` (1) | Producto | webOrders o landingPages |
| `/builder/2` | Plantilla | basic / standard / premium |
| `/builder/3` | Bloques | checkbox de bloques disponibles (`useProductBlocks`), obligatorios deshabilitados |
| `/builder/4` | Config | nombre, slug kebab-case, colores (primary/secondary/accent), fuentes (heading/body) |
| `/builder/5` | Textos | `TextEditor` por bloque (`BLOCK_FIELDS` + `DEFAULT_TEXTOS` prefilled) |
| `/builder/6` | Imágenes | logo, favicon, hero (si hero), about (si about), galería (si gallery) |
| `/builder/7` | Descargar | resumen + `DownloadButton` → `POST /api/generate-repo` |

- Estado: `stores/builderStore.ts` (Zustand, no persistido). `useFormValidation` gatea "Siguiente".
- Preview: `lib/preview/*` renderiza las páginas reales de la plantilla con la config en curso
  (`PreviewPanel` en dashboard + `PreviewOverlay` flotante). El menu/status/checkout del preview llaman a la API real (4000).
- API: `POST /api/generate-repo` recibe `{product, template, selectedBlocks, config, textos, imagenes, configImages}`
  y devuelve el ZIP (ver §5).
- Telemetría de la sesión: la UI emite eventos (`lib/telemetry.ts` → `emitWizard`) a `POST /api/events`
  (`lib/wizardEvents.ts` los anexa a `logs/wizard.ndjson`); el pipeline de generación emite su progreso desde
  `apps/builder-ui/pages/api/generate-repo.ts`. Esa cola alimenta el monitoreo en vivo de `scripts/appsbuilder.ps1`.
- Cloudinary: `lib/cloudinary.ts` (`uploadAllImages`) sube las imágenes locales y devuelve URLs; requiere
  `NEXT_PUBLIC_CLOUDINARY_*` en `apps/builder-ui/.env.local`.

## 5. Pipeline de generación (`apps/builder-ui/lib/generator/`)

Orden en `index.ts` → `generateRepo(state, onProgress?)`, que reporta cada etapa
(`readMasterFiles → cleanUnusedBlocks → uploadAllImages → injectConfig → createZip → done`) con porcentaje:

1. **`readMasterFiles`** (`fileProcessor.ts`): copia del master (recursivo, local) siempre
   `packages/{ui,utils,types,hooks,configs,blocks}`; para `webOrders` además `apps/backend` + `apps/web-admin`;
   el template `apps/products/<producto>/templates/_<t>`, y los dirs de bloques seleccionados
   (`packages/blocks/<block>`). **Excluye**: `node_modules`, `dist`, `.next`, `.git`, `.turbo`, `.log`,
   y los archivos `.env`, `.env.local`, `.env.development`.
2. **`cleanUnusedBlocks`** (`cleaner.ts`): borra del ZIP los dirs de bloques NO seleccionados y, en los
   `page.tsx`, elimina imports y **elementos JSX completos** de componentes dominados por bloques ausentes
   (balance de tags, self-closing incl.). Bloques siempre presentes en webOrders (`ALWAYS_INCLUDE`):
   `menu, cart, checkout, admin, hero, about, layout, auth`. El mapa `BLOCK_COMPONENTS` dice qué componentes
   pertenecen a cada bloque (hero→HeroSimple/HeroWithCarousel/HeroWithVideo, etc.).
3. **`uploadAllImages`** (`lib/cloudinary.ts`): sube logo/favicon/hero/about/offer (y galería) → URLs.
4. **`injectConfig`** (`injector.ts`): reemplaza los placeholders `INJECT_*` según tipo de archivo
   (ver §6). También genera `generateSiteConfig` → `packages/configs/site.config.ts` con la config completa
   (`ProjectConfig`: name, slug, colors, fonts, logo/favicon, textos, images, blocks, y campos opcionales).
5. **`renameEnvFiles`**: `.env.local.example` → `.env.local` (inyecta `NEXT_PUBLIC_API_URL=http://localhost:4000`),
   `apps/backend/.env.example` → `apps/backend/.env` con `MONGODB_URI=` vacío. **Nunca filtra credenciales.**
6. **`createZip`** (`zipCreator.ts`): agrega `package.json` raíz ({name: slug}, scripts dev/build con `pnpm --filter "./apps/**"`),
   `pnpm-workspace.yaml` (incluye templates), `sync-master.sh` y `README.md` de deploy. Devuelve el `.zip` (DEFLATE).

### Placeholders `INJECT_*` (fuente de verdad: `injector.ts`)

| Dónde | Qué se inyecta |
|---|---|
| `tailwind.config.ts` + `globals.css` | colores y fuentes (`INJECT_PRIMARY_COLOR`, `INJECT_FONT_*`…) |
| archivos `app/`, `components/`, `sections/`, `globals.css` | textos por bloque (`INJECT_HERO_TITLE`, `INJECT_MENU_TITLE`, `INJECT_CONTACT_*`, `INJECT_OFFER_*`, `INJECT_NEWSLETTER_*`…) + URLs de imágenes |
| `package.json` | nombre (`INJECT_PROJECT_NAME`) con sufijo por app: `-backend`, `-admin`, `-web` |
| archivos `.env*` | `INJECT_API_URL` y `INJECT_MAPBOX_TOKEN` se vacían; `INJECT_TENANT_NAME` → nombre |

El ZIP final **no debe** contener ningún `INJECT_*` sin resolver (verificado en la gran prueba).

## 6. ZIP generado — estructura y seguridad

```
<slug>/
├─ package.json, pnpm-workspace.yaml, README.md, sync-master.sh
├─ packages/{ui,utils,types,hooks,configs,blocks/<seleccionados>}/
│  └─ configs/site.config.ts            # config visual/textos/bloques inyectada
├─ apps/products/<producto>/templates/_<t>/…   # web de la plantilla (inyectada + limpia)
├─ apps/backend/…                        # solo webOrders (sin .env reales, MONGODB_URI vacío)
└─ apps/web-admin/…                      # solo webOrders
```

- `sync-master.sh` hace `git checkout appsbuilder/main -- packages/*` (agrega remote `appsbuilder`),
  commit y push. Sirve para que el cliente tome actualizaciones de bloques del master.
- `README.md` generado: instrucciones de deploy (web/admin/backend por producto) + aviso de completar env.
- Seguridad: el generador **excluye `.env*`** al copiar y **vacía credenciales** en los env inyectados;
  Cloudinary sube imágenes, nunca secretos. Verificado con `git grep`.

## 7. Paquetes compartidos (`packages/*`)

### `@saas/blocks` (`packages/blocks/index.ts`)

| Dominio | Bloques |
|---|---|
| hero | HeroSimple, HeroWithCarousel, HeroWithVideo |
| menu | MenuBrowser, MenuGrid, CategoryFilter, MenuCarousel, MenuList, SearchBar, FeaturedBanner, StoreClosed, AddonsModal, ProductCard |
| cart | CartItemCard, CartItemHeader, CartItemExtrasPanel, CartEmpty |
| checkout | CheckoutForm, SummarySection, DeliveryTypeSelector, AddressAutocomplete, MapPicker, AddressMap, DeliveryCostPreview, CouponSection, DeliveryAddressWarningModal |
| admin | AdminApp (level basic/standard/premium), OverviewTab, OrdersTab, MenuTab, CouponsTab, GalleryTab, ConfigTab, QuickOrderForm (+ BasicSections para basic) |
| layout | PublicLayout, SiteHeader, SiteFooter, StoreStatus, PromoBanner |
| auth | LoginPage |
| contenido | about, cta, contact, gallery, featured, offer, testimonials, newsletter |
| landing | features, pricing, faq |

Regla: los bloques reciben contenido por props desde `ProjectConfig` (`site.config.ts`); **ningún texto ni color hardcodeado**
se usa en runtime: `--color-primary` etc. vienen de la config inyectada. (En templates aún hay `INJECT_*` literales que el generador
reemplaza; en runtime las páginas usan `useSiteConfig()` → `clientConfig`.)

### `@saas/hooks` (`packages/hooks/index.ts`)

- Cliente API: `API_URL`, `apiFetch`, `authHeaders` (Bearer desde `localStorage['saas-auth-storage-token']`).
- Stores: `useCartStore` (+`CREDIT_SURCHARGE_RATE`), `useAuthStore` (persiste en `saas-auth-storage`).
- Cliente público: `useMenu`, `useStoreStatus` (fetch `/api/config/status` + **polling 15 s** + ETag), `useCheckout`,
  `useDelivery`, `useAddressSearch`.
- Admin: `useAdminCrud`, `useAdminOrders`, `useAdminMenu`, `useAdminConfig`, `useAdminOverview`, `useAdminCoupons`,
  `useAdminGallery`, `useQuickOrder`.
- Utilidades: `generateComandaHTML`/`printComanda`.
- Runtime sitio (preview + ZIP): `SiteConfigProvider`/`useSiteConfig`, navegación (`SiteNavProvider`, `NextNavBridge`,
  `useSitePathname`, `useSiteRouter`, `useSiteNavigate`, `setSitePathname`).

### Otros paquetes

- `@saas/ui`: componentes atómicos base (Button, Card, Input…).
- `@saas/types`: tipos compartidos.
- `@saas/utils`: `cn`, `formatPrice`, `isValidHex`, utilidades de timezone ARG (`argWeekday`, `isArgNowBetween`, `argNow`).
- `@saas/configs`: `ProjectConfig` (base), `featureFlags`, `site.config` (`clientConfig` — generado por el builder).

## 8. Backend (`apps/backend`)

Express + Helmet + CORS (allowlist `CLIENT_URL`, en dev acepta todo) + `express.json` (1 MB) + request logger.
Arranque (`server.ts`): `validateEnv` → `connectDB` (con reintentos; sin DB arranca igual, `db: down`) →
`ensureSeeded` si la base está vacía → `createApp` → HTTP + Socket.io (`initSocket`, emite pedidos nuevos a admins)
→ listen 4000. Cierre ordenado en SIGTERM/SIGINT.

### Env (`config/env.ts`)

`PORT`(4000), `NODE_ENV`, `MONGODB_URI`(default `mongodb://localhost:27017/appsbuilder-demo`), `JWT_SECRET`,
`JWT_EXPIRES_IN`(4h), `CLIENT_URL`, `STORE_LAT/STORE_LNG`, `MAPBOX_TOKEN`, `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`,
`GEOCODING_BUDGET_MONTHLY`(8000). Uso real en `apps/backend/.env` (**gitignored**); referencia en `.env.example`.

### Rutas (`routes/index.ts`), todas bajo `/api`

| Ruta | Uso |
|---|---|
| `/health` | health + `db: up/down` |
| `/products`, `/categories`, `/addons` | públicos + `/admin` (CRUD autenticado) |
| `/orders` | públicos(`POST` crear) + `/admin?range=` + `PUT /admin/:id/status` |
| `/delivery` | `POST /delivery/calculate` |
| `/coupons` | `GET|POST /admin`, `POST /validate/:code` |
| `/analytics` | `GET ?range=hoy|ayer|semana|mes` |
| `/gallery` | `GET /images`, `POST|DELETE /admin*` (Cloudinary) |
| `/geocoding` | `GET ?q=` (Mapbox, con fallback Haversine si no hay token) |
| `/users` | `POST /login` (JWT) |
| `/config` | `GET /`, `GET|PUT /status`, `PUT /schedule|banner|rain|emergency`, `POST|DELETE /delivery-ranges`; `PUT /schedule` valida horarios `HH:mm` por día |

Módulos por dominio (`modules/<x>/{model,controller,routes,service,schema}`):
products, categories, adicionales(addons), orders, delivery, coupons, analytics, gallery, geocoding, users, schedules(config).

### Seed (`src/scripts/seed.ts` + `seedData.ts`)

- **Auto-seed**: al arrancar, si la base está vacía (`ensureSeeded`) se puebla todo (usuarios, categorías, addons,
  productos, cupones, galería, config con horarios, pedidos/daily demo relativos a HOY).
- **Manual**: `pnpm --filter @saas/backend seed` (idempotente, upsert).
- **Refresh demo**: `SEED_REFRESH_DEMO=1 pnpm --filter @saas/backend seed` borra orders/daily/ordercounters y
  re-rola la línea de tiempo relativa a hoy (para que el dashboard "hoy" no quede en 0 con el paso de los días).
- **Credenciales**: `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` (default `admin@local.dev` / `admin123`), comentadas en `.env`.
- Pedidos demo: últimos 7 días, hoy más activo, siempre con `createdAt` pasada; contador `ordercounters` sincronizado
  para collides (los reales siguen tras los demo, ej. `20260918-005`).

### Timezone (cliente y backend)

Argentina: `America/Argentina/Buenos_Aires`. `useStoreStatus`/`isArgNowBetween` comparan strings `HH:mm` (correcto
para horarios normales; **edge conocido**: un turno que cierra después de medianoche, ej. `20:00–02:00`, da `closed`).

## 9. Web Admin (`apps/web-admin`)

Next 15 App Router, React 18, Zustand. Rutas: `/` (redirige a `/admin`), `/login` (usa `useAuthStore.login()`),
`/admin` (shell con `AdminApp` desde `@saas/blocks/admin`), `/admin/layout` (guard de sesión: valida token vía
`GET /api/orders/admin?range=hoy` con `authHeaders`; si da 401 → logout + redirect a `/login`).

## 10. Templates (`apps/products/*/templates/_*`)

Los templates son **apps Next.js finas que importan `@saas/blocks`**; la estética la define la config inyectada.

### webOrders

Rutas por template (todas importan bloques de `@saas/blocks` + `PublicLayout` de `src/components/layout`):

| Ruta | basic | standard | premium |
|---|---|---|---|
| `/` (home) | MenuBrowser list + MiniHero + StoreStatus + PromoBanner | Hero + About + CTA (condicionales por `cfg.blocks`) + PromoBanner | igual standard + secciones premium |
| `/menu` | — | menú completo | menú completo |
| `/cart`, `/checkout`, `/order-confirmation` | ✓ | ✓ | ✓ |
| `/login` | ✓ | ✓ | ✓ |
| `/admin` | `AdminApp level="basic"` | `AdminApp level="standard"` | `AdminApp level="premium"` |

Los bloques siempre presentes en el ZIP (webOrders) son `menu, cart, checkout, admin, hero, about, layout, auth`
(`cleaner.ts ALWAYS_INCLUDE`) aunque el usuario no los marque; el resto se limpia.

### landingPages

Solo home single-page: secciones compuestas directamente en `src/app/page.tsx` (Hero → About → Gallery →
Testimonials → Offer → CTA → Contact → Newsletter según template/block). **Sin carrito, sin backend, sin admin**
(`PRODUCT_APPS.landingPages = []`). El ZIP solo lleva packages + template.

### Frontend de templates

`next` ^16 / `react` ^19 (los templates; builder-ui/admin usan next 15/react 18), Tailwind 4, zustand.
Config visual: CSS vars en `globals.css` (`--color-primary`, `--color-secondary`, `--color-accent`,
`--font-heading`, `--font-body`) + `tailwind.config.ts` con `INJECT_*` (reemplazados por el generador).

## 11. Seguridad

- `.gitignore` (UTF-8) ignora: `.env*`, `*.pem|*.key|*.p12|*.pfx|*.jks`, `id_rsa*`, `credentials*.json`,
  `service-account*.json`, `logs/`, `node_modules`, `.next`, dist de librerías (NO ignora `src/`).
- Solo `.env.example` suben al repo (placeholders). `pnpm-lock.yaml` SÍ se versiona.
- El ZIP generado nunca incluye `.env` del master ni credenciales; `MONGODB_URI` sale vacío en el backend generado.
- Escaneo: `git grep` periódico para `AIza|sk-|ghp_|Bearer|password=` (sin resultados en trackeados).

## 12. Convenciones de desarrollo

- **Una estética, variantes por props + lock por plantilla**: los bloques son compartidos; basic/standard/premium
  difieren en composición y props (`variant`, `columns`, `level`); qué bloques existen en el ZIP lo decide
  `cleaner.ts` (`BLOCK_COMPONENTS` + `ALWAYS_INCLUDE`) y `cfg.blocks` en runtime.
- **NO duplicar chrome por plantilla**: Header, Footer, StatusBar, Login, Cart/Checkout wrappers y Admin viven en
  bloques compartidos; un cambio se hace 1 vez en `packages/blocks`.
- **Jerarquía de imports**: Plantilla → Bloques → Componentes; Bloque → Componentes/Bloques; Componente → Componentes.
- **Admin unificado**: `AdminApp` con prop `level` cubre las 3 plantillas (basic → `BasicSections`; standard/premium
  → shells con tabs). Las páginas admin de cada template son wrappers con login guard.
- Comentarios del código en español y actualizados (no describir lo que ya no existe).
- Git: Conventional Commits; el commit/push lo hace el usuario (preguntar antes).