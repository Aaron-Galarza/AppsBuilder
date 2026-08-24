## RESUMEN RÁPIDO

### QUÉ ES:

Herramienta interna que genera repos customizados en 30 minutos.

### CÓMO FUNCIONA:

1. Abrís AppsBuilder
2. Llenas formulario
3. Clickeás "Descargar"
4. Backend procesa y genera ZIP
5. Descargas repo listo para deployar

### STACK:

- Builder Frontend: Next.js + TypeScript + Tailwind + Shadcn/ui + Zustand
- Builder Backend: Next.js API Routes + JSZip + Sharp + Cloudinary
- Proyecto Cliente Frontend: Next.js + TypeScript + Tailwind + @saas/ui + @saas/blocks
- Proyecto Cliente Backend: Express + MongoDB + Mongoose + JWT

### AHORRO:

Antes: semanas de trabajo manual
Ahora: menos de una hora
Ahorro: 80% de tiempo

### ESCALABILIDAD:

1 bloque = N clientes usándolo
1 actualización en master = todos se benefician
N clientes = N repos independientes (sin conflictos)

---

## QUÉ ES APPSBUILDER

AppsBuilder es una herramienta interna (Next.js) que permite generar repositorios completos y customizados para diferentes tipos de clientes

NO es para clientes. Es para nosotros Facu

### PROBLEMA QUE RESUELVE:

#### Antes (SIN AppsBuilder):

Nuevo cliente → Empenzar todo de 0:

- Pensar idea
- Crear repo
- Renombrar archivos y referencias
- Cambiar colores en 5+ lugares
- Cambiar textos en 8+ lugares
- Testear todo funcione

#### Ahora (CON AppsBuilder):

Nuevo cliente → llenamos un formulario web (5 min) → Descargas ZIP → 15 min deploy o se ejecuta local para mostrar

Total: menos de una hora de trabajo

## ARQUITECTURA GENERAL

## AppsBuilder tiene 3 capas:

### CAPA 1: MASTER REPO (AppsBuilder en GitHub)

Código reutilizable que NUNCA se toca directamente.
Es el origen de todos los proyectos.

```
saas-builder/
├── packages/                 (Código compartido - idéntico en todos)
│   ├── ui/                   (Componentes base: Button, Card, Input, etc)
│   ├── blocks/               (Secciones enchufables: Hero, Menu, CTA, etc)
│   ├── types/                (TypeScript types: Order, Product, User, etc)
│   ├── configs/              (Configuraciones default y templates)
│   ├── utils/                (Funciones: distance, timezone, format, etc)
│   └── hooks/                (Hooks reutilizables: useMenu, useCart, etc)
│
├── apps/
│   ├── backend/              (Express genérico - base para todos los clientes)
│   ├── web-admin/            (Panel admin genérico - base para todos)
│   │
│   ├── builder-ui/           ------ LA HERRAMIENTA ----
│   │
│   └── products/              (Productos que puede generar AppsBuilder)
│        ├── webInstitutional/
│        ├── landingPages/
│        └── webOrders/
│            └── templates/    (Plantillas base para nuevos proyectos)
│               ├── _basic/    (Checkout + Menú)
│               ├── _standard/ (Checkout + Menú + Home)
│               └── _premium/  (Todo + Galería + Testimonios)
│
└── docs/ (instrucciones)
```

### CAPA 2: BUILDER UI (Herramienta visual)

Interfaz web donde configuras proyectos.

Flujo (5 pasos):

1. Elegir plantilla (Basic/Standard/Premium)
2. Seleccionar bloques (Hero, Menu, About, CTA, etc)
3. Configurar colores y tipografía (Nivel basico - superficial)
4. Configurar textos por bloque
5. Subir imágenes
6. Ver preview en vivo
7. Generar y descargar ZIP

#### Stack Frontend de la herramienta:

- Next.js 16 + TypeScript
- Tailwind CSS + Shadcn/ui
- Zustand (state management)
- React Hook Form + Zod (forms)
- react-color (color picker)
- Deployment: Vercel

### CAPA 3: GENERADOR DE REPOS (Backend del builder)

Procesa la configuración y genera el ZIP descargable

Ubicación: /saas-builder/apps/builder-ui/pages/api/generate-repo.ts

Flujo:

1. Recibe configuración seleccionados en la **Capa 2** (template, bloques, colores, textos, imágenes, etc)
2. Lee archivos del master repo desde GitHub
3. Modifica en memoria:
    - Elimina bloques NO seleccionados
    - Inyecta colores en tailwind.config.ts
    - Reemplaza textos en componentes
    - Sube imágenes a Cloudinary
    - Edita package.json (nombre proyecto)
    - Crea config files (.env, configs)

4. Comprime TODO en ZIP
5. Retorna descarga automática

#### Stack Backend:

- Next.js API Routes + TypeScript
- JSZip (crear archivos ZIP en memoria)
- Sharp (procesar imágenes)
- Cloudinary (subir imágenes a cloud)
- Zod (validar input)
- Deployment: Vercel Serverless

### CAPA 4: PROYECTO CLIENTE (ZIP descargado)

Repo completo e independiente que nosotros deployamos para el cliente

```
EJEMPLO:

pizzaya.zip (descargado)
├── packages/           (Mismo código del master)
├── apps/
│   ├── backend/        (Express listo para Render)
│   ├── web-admin/      (Next.js admin para Vercel)
│   └── web/
│       └── pizzaya/    (Next.js web para Vercel - CON COLORES INYECTADOS)
│
└── .env, package.json, etc (TODO LISTO)
```

#### Luego en una consola:

```bash
unzip pizzaya-weborder.zip git init && git remote add origin ...
pnpm install deploy (backend, admin, web)
```

## FLUJO PASO A PASO: CÓMO GENERAR UN PROYECTO

### PASO 1: ACCEDES A LA HERRAMIENTA —> Local y Web

```
┌─────────────────────────────────────┐
│ APPSBUILDER                         │
│ Generador de repositorios           │
│                                     │
│ [PASO 1/7] ELEGIR PRODUCTO          │
│                                     │
│ ○ Menu Digital                      │
│ ○ Landing Page                      │
│ ○ Pagina Institucional              │
│                                     │
│ Elijo: Menu Digital                 │
│                                     │ 
│ [SIGUIENTE] [CANCELAR]              │
│                                     │
└─────────────────────────────────────┘

**ACLARACIÓN TÉCNICA:**
El generador es "context-aware": 
- Detecta el producto y muestra plantillas/bloques relevantes
- PERO: El ZIP descargado tiene packages/ COMPLETO
- Podés copiar-pegar bloques de otros productos si después los necesitas
- Ejemplo: Descargaste "Menu Digital" pero querés agregar "Newsletter" (que es de Landing) → Copias archivo del bloque, importas, listo
```

### PASO 2: SELECCIONAR PLANTILLAS

```
┌─────────────────────────────────────┐
│ APPSBUILDER                         │
│ Generador de repositorios           │
│                                     │
│ [PASO 1/7] ELEGIR PLANTILLA         │
│                                     │
│ ○ Basic   (Checkout + Menú)         │
│ ○ Standard (+ Home)                 │
│ ○ Premium  (+ Todo)                 │
│                                     │
│ Elijo: Standard                     │
│                                     │ 
│ [SIGUIENTE] [CANCELAR]              │
│                                     │
└─────────────────────────────────────┘
```

### PASO 2: SELECCIONAR BLOQUES

¿Qué secciones quiere agregar?

```
┌─────────────────────────────────────────┐
│ PASO 2/7 SELECCIONAR BLOQUES            │
│                                         │
│ Plantilla: Standard                     │
│ Bloques disponibles:                    │
│                                         │
│ ☐ Hero          (imagen + título)       |
│ ☑ Menu         (OBLIGATORIO)           │
│ ☐ Featured      (top productos)         │
│ ☑ About        (sobre nosotros)        │
│ ☑ CTA          (llamada acción)        │
│ ☐ Contact       (formulario)            │
│ ☐ Gallery       (fotos)                 │
│ ☐ Testimonials  (reviews)               │
│ ☐ Offer         (promociones)           │
│ ☐ Newsletter    (suscripción)           │
│                                         │
│ Seleccionaste: Menu, About, CTA         │
│                                         │
│ [SIGUIENTE] [ATRÁS]                     │
│                                         │
└─────────────────────────────────────────┘
```

### PASO 3: CONFIGURAR COLORES

```
┌────────────────────────────────────────┐
│ PASO 3/7 CONFIGURACIÓN VISUAL          │
│                                        │
│ Nombre restaurante:                    │
│ [PizzaYa_____________________]         │
│                                        │
│ Color primario (botones, accents):     │
│ [██████] #ff0000                       │
│ (color picker interactivo)             │
│                                        │
│ Color secundario (backgrounds):        │
│ [██████] #fff000                       │
│                                        │
│ Color accent (borders, dividers):      │
│ [██████] #333333                       │
│                                        │
│ Tipografía:                            │
│ ○ Inter ○ Poppins ○ Playfair ○ Other   │
│                                        │
│ Logo:                                  │
│ [Drag & drop] → pizzaya-logo.png       │
│ (Preview: [pequeño logo])              │
│                                        │
│ Favicon:                               │
│ [Drag & drop] → favicon.ico            │
│                                        │
│ [SIGUIENTE] [ATRÁS]                    │
│                                        │
└────────────────────────────────────────┘
```

### PASO 4: CONFIGURAR TEXTOS

Por cada bloque que seleccionaste:

```
┌─────────────────────────────────────┐
│ PASO 4/7 TEXTOS POR BLOQUE          │
│                                     │
│ ABOUT                               │
│ ─────────────────────────────────   │
│ Título:                             │
│ [Nuestra Historia_____________]     │
│                                     │
│ Descripción:                        │
│ [Somos un pequeño restaurante       │
│  que empezó en 2020 con la          │
│  pasión de hacer las mejores        │
│  pizzas del barrio...]              │
│                                     │
│ CTA                                 │
│ ─────────────────────────────────   │
│ Título principal:                   │
│ [¿Listo para ordenar?**]              │
│                                     │
│ Texto botón:                        │
│ [Haz tu pedido ahora**_]              │
│                                     │
│ [SIGUIENTE] [ATRÁS]                 │
│                                     │
└─────────────────────────────────────┘
```

### PASO 5: SUBIR IMÁGENES

```
┌────────────────────────────────────┐
│ PASO 5/7 IMÁGENES                  │
│                                    │
│ ABOUT - Foto del local:            │
│ [Drag & drop] → local.jpg          │
│ (Preview: [img pequeña])           │
│                                    │
│ [SIGUIENTE] [ATRÁS]                │
│                                    │
└────────────────────────────────────┘
```

### PASO 6: VISTA PREVIA

Al finalizar, se ve Preview

```
┌────────────────────────────────────┐
│ PREVIEW (lado derecho)             │
│                                    │
│ [PizzaYa LOGO]                     │
│ ═════════════════════════════════  │
│                                    │
│ [ABOUT IMAGEN]                     │
│ NUESTRA HISTORIA                   │
│ Somos un pequeño restaurante...    │
│                                    │
│ ═════════════════════════════════  │
│                                    │
│ NUESTRO MENÚ                       │
│ [Producto1] [Producto2] [Producto3]│
│ [Producto4] [Producto5] [Producto6]│
│                                    │
│ ═════════════════════════════════  │
│                                    │
│ ¿LISTO PARA ORDENAR?               │
│ [Haz tu pedido ahora]              │
│                                    │
│ ═════════════════════════════════  │
│ © PizzaYa 2024                    │
│                                    │
└────────────────────────────────────┘
```

### PASO 7: GENERAR Y DESCARGAR

```
┌──────────────────────────────────┐
│ PASO 7/7 GENERAR                 │
│                                  │
│ Configuración lista:             │
│ ✓ Plantilla: Standard            │
│ ✓ Bloques: 3 seleccionados       │
│ ✓ Colores configurados           │
│ ✓ Textos configurados            │
│ ✓ Imágenes subidas               │
│                                  │
│ Procesando...                    │
│ ████████████████░░░ 75%          │
│                                  │
│ [GENERANDO ZIP...]               │
│                                  │
│ Descargando: pizzaya-weborder.zip│
│ (120 MB)                         │
│                                  │
└──────────────────────────────────┘
```

Cada cliente descargado NECESITA su propia configuración independiente.

### **Variables de entorno por cliente:**

```bash
# Cada .env es ÚNICO x Cli
MONGODB_URI=mongodb+srv://user:pass@client-cluster.mongodb.net/db
JWT_SECRET=secret-unico-por-cliente
CLOUDINARY_NAME=cloudinary-name-del-cliente
CLOUDINARY_API_KEY=key-unico
CLOUDINARY_SECRET=secret-unico
MAPBOX_TOKEN=token-unico-por-cliente
```

#### Backend del builder (API route):

1. Recibe configuración JSON
2. Lee archivos del master desde GitHub
3. Copia estructura completa
4. Inyecta colores en tailwind.config.ts
5. Reemplaza textos en componentes
6. Sube imágenes a Cloudinary
7. Edita package.json (nombre = "pizzaya-web")
8. Crea .env.local con URLs
9. Crea pizzaya.config.ts con colores
10. ELIMINA / LIMPIA TODO LO QUE NO SE UTILIZA Y DEJA SOLO LO CONFIGURADO
11. Comprime TODO en ZIP con jszip
12. Retorna descarga

### LIMPIEZA DEL ZIP: QUÉ SE ELIMINA

El generador es AGRESIVO con la limpieza:

- Si NO seleccionas Gallery → `packages/blocks/gallery/` NO se incluye
- Si NO seleccionas Newsletter → `packages/blocks/newsletter/` NO se incluye
- Resultado: ZIP más pequeño, repo más limpio

**Qué SIEMPRE se incluye (obligatorio):**

- `packages/ui/` → base de todo
- `packages/utils/` → funciones compartidas
- `packages/types/` → tipos TypeScript compartidos
- `packages/hooks/` → hooks reutilizables
- `packages/configs/` → configuraciones

**Si cliente después quiere agregar un bloque no seleccionado:**

OPCIÓN 1 (Recomendada): Vuelve a usar AppsBuilder

- Regenera con el bloque nuevo
- Descarga ZIP actualizado
- Mergea cambios en git

OPCIÓN 2: Copia manual

- Busca el bloque en `packages/blocks/` del master
- Cópiao al proyecto descargado
- Importa en componentes que lo necesiten

### pizzaya.zip descargado contiene:

```
pizzaya-weborder/
├── packages/        (Código compartido, igual al master)
├── apps/
│   ├── backend/     (Express listo para Render)
│   ├── web-admin/   (Next.js admin para Vercel)
│   └── web/pizzaya/ (Next.js web para Vercel - CUSTOMIZADO)
│
└── (TODO LISTO PARA DEPLOYAR)
```

### En una consola:

```bash
unzip pizzaya.zip cd pizzaya-weborder
git init git remote add origin https://github.com/tuuser/pizzaya-weborder.git
$ pnpm install
```

```
# Deploy
$ cd apps/backend && render deploy --prod
$ cd ../web-admin && vercel deploy --prod
$ cd ../templates/pizzaya && vercel deploy --prod

✅ PRODUCCIÓN EN 30 MINUTOS

URLs:
  Frontend: <https://pizzaya-web.vercel.app>
  Admin: <https://pizzaya-admin.vercel.app>
  Backend: <https://pizzaya-backend.onrender.com>
```

### GIT & MASTER: ESTRATEGIA DE ACTUALIZACIONES

Cuando el cliente descarga el ZIP:

- Es un repositorio INDEPENDIENTE
- No tiene vinculación con el master
- Es AISLADO (sin riesgos de romper el master)

Si hay actualización en el master (@saas-builder):

ESTRATEGIA ACTUAL (MVP):

1. Informás al cliente: "Hay actualización disponible"
2. Cliente accede a AppsBuilder nuevamente
3. Rellena misma config (o similar)
4. Descarga ZIP actualizado
5. Mergea cambios con `git` manualmente:
$ git merge --no-ff origin/updated-version
6. Resuelve conflictos si hay

ESTRATEGIA FUTURA (Cuando crezcas):

- Publicas @appsbuilder/ui, @appsbuilder/blocks como paquetes npm privados
- Cliente actualiza: `pnpm update @appsbuilder/ui@latest`
- Automatizado, sin trabajo manual

VENTAJA: El cliente siempre usa código seguro y actualizado.
RESPONSABILIDAD: Vos mantenés el master limpio y sin bugs.

## ESTRUCTURA DEL MASTER (AppsBuilder repo)

```
apps-builder/
│
├── packages/                    (CÓDIGO REUTILIZABLE - IGUAL PARA TODOS)
│   │
│   ├── ui/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useTheme.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   └── tailwind.css
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── blocks/
│   │   ├── hero/
│   │   │   ├── HeroSimple.tsx
│   │   │   ├── HeroWithVideo.tsx
│   │   │   ├── index.ts
│   │   │   └── README.md
│   │   ├── menu/
│   │   │   ├── MenuGrid.tsx
│   │   │   ├── MenuCarousel.tsx
│   │   │   ├── index.ts
│   │   │   └── README.md
│   │   ├── about/
│   │   ├── cta/
│   │   ├── contact/
│   │   ├── featured/
│   │   ├── testimonials/
│   │   ├── gallery/
│   │   ├── offer/
│   │   ├── newsletter/
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/
│   │   ├── order.ts
│   │   ├── product.ts
│   │   ├── user.ts
│   │   ├── delivery.ts
│   │   ├── analytics.ts
│   │   ├── api.ts
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── configs/
│   │   ├── base.config.ts
│   │   ├── featureFlags.ts
│   │   ├── utils.ts
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utils/
│   │   ├── distance.ts
│   │   ├── timezone.ts
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   ├── constants.ts
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── hooks/
│       ├── useMenu.ts
│       ├── useCart.ts
│       ├── useCheckout.ts
│       ├── useDelivery.ts
│       ├── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── apps/
│   │
│   ├── backend/
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── orders/
│   │   │   │   ├── products/
│   │   │   │   ├── categories/
│   │   │   │   ├── delivery/
│   │   │   │   ├── analytics/
│   │   │   │   ├── auth/
│   │   │   │   └── ...
│   │   │   ├── middlewares/
│   │   │   ├── utils/
│   │   │   ├── config/
│   │   │   ├── routes/
│   │   │   ├── socket/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── .env.example
│   │   ├── render.yaml
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web-admin/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── stores/
│   │   │   └── ...
│   │   ├── .env.example
│   │   ├── vercel.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── builder-ui/            LA HERRAMIENTA
│   │   ├── pages/
│   │   │   └── builder/
│   │   │       ├── index.tsx         (Step 1)
│   │   │       ├── [step].tsx        (Steps 2-7)
│   │   │       └── layout.tsx
│   │   ├── pages/api/
│   │   │   └── generate-repo.ts      (Backend generador)
│   │   ├── components/
│   │   │   ├── TemplateSelector.tsx
│   │   │   ├── BloqueCheckbox.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── TextEditor.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   └── PreviewPanel.tsx
│   │   ├── stores/
│   │   │   └── builderStore.ts
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── styles/
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └──products/              (Productos que puede generar AppsBuilder)
│        ├── webInstitutional/
│        ├── landingPages/
│        └── webOrders/
│            └── templates/    (Plantillas base para nuevos proyectos)
│									├── _basic/
│                 │   ├── src/
│                 │   ├── public/
│                 │   ├── .env.local.example
│                 │   ├── vercel.json
│                 │   ├── package.json
│                 │   └── tsconfig.json
│                 ├── _standard/
│                 │   └── (misma estructura)
│                 └── _premium/
│                     └── (misma estructura)
│
│       
├── docs/
│   ├── GETTING_STARTED.md
│   ├── ARCHITECTURE.md
│   ├── BUILDER_GUIDE.md
│   └── TECH_STACK.md
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── .gitignore
```

## STACK TECNOLÓGICO

### BUILDER UI (Interfaz visual)

#### Frontend del Builder:

- Next.js 16 (framework React)
- TypeScript (tipos estrictos)
- Tailwind CSS (estilos)
- Shadcn/ui (componentes pre-diseñados)
- Zustand (state management global)
- React Hook Form + Zod (formularios + validación)
- react-color (color picker)
- Lucide React (iconos)
- Deployment: Vercel

#### Backend del Builder (API Route):

- Next.js API Routes (serverless)
- TypeScript
- JSZip (crear ZIP en memoria)
- Sharp (procesar imágenes)
- Cloudinary (subir imágenes a cloud)
- Zod (validar input)
- Fetch API (obtener archivos del master)
- Regex (reemplazar strings en código)
- Deployment: Vercel Serverless

### PROYECTO GENERADO (lo que descargas)

#### Frontend (pizzaya-web):

- Next.js 16 + TypeScript
- Tailwind CSS
- @saas/ui (componentes reutilizables)
- @saas/blocks (secciones: Hero, Menu, About, CTA, etc)
- @saas/types (types compartidos)
- @saas/utils (funciones compartidas)
- @saas/hooks (hooks reutilizables)
- Zustand (carrito, autenticación)
- Mapbox (delivery, autocomplete dirección)
- Deployment: Vercel

#### Backend (pizzaya-backend):

- Express + TypeScript
- Node.js
- MongoDB (base de datos)
- Mongoose (ODM para MongoDB)
- JWT (autenticación)
- Socket.io (realtime)
- Mapbox API (cálculo entregas)
- Cloudinary (imágenes)
- Deployment: Render

#### Admin Panel (pizzaya-admin):

- Next.js 16 + TypeScript
- Tailwind CSS
- @saas/ui
- Zustand (estado admin)
- Deployment: Vercel

## COMPONENTES vs BLOQUES vs PLANTILLAS

### COMPONENTES BASE (@saas/ui)

Piezas pequeñas reutilizables en TODO.
Ejemplos: Button, Card, Input, Modal, Badge

```
Button.tsx
├── Props: variant, size, color, onClick
├── Importado por: Bloques, Layouts, Formularios
└── Reutilización: 100%
```

```
Card.tsx
├── Props: padding, shadow, borderRadius
├── Importado por: Bloques, Layouts
└── Reutilización: 100%
```

#### BLOQUES (@saas/blocks)

Secciones completas lista para usar.
Ejemplos: Hero, Menu, About, CTA, Gallery

```
HeroSimple.tsx
├── Importa: Button (from @saas/ui)
├── Props: title, subtitle, imageSrc, primaryColor, ctaText
├── Uso: En home page para captar atención
└── Reutilización: 80%
```

```
MenuGrid.tsx
├── Importa: Card, Button (from @saas/ui)
├── Props: columns, primaryColor
├── Uso: Mostrar catálogo de productos
└── Reutilización: 100% (obligatorio en todas las plantillas)
```

#### PLANTILLAS (apps/templates/)

Layouts base que contienen varios bloques.
Ejemplos: Basic, Standard, Premium

```
_basic
├── Contiene: Checkout + Menú (minimalista)
├── Bloques incluidos: Menu (obligatorio)
└── Para: MVP, pruebas rápidas
```

```
_standard
├── Contiene: Checkout + Menú + Home
├── Bloques disponibles: Hero, Menu, About, CTA, Featured
└── Para: La mayoría de restaurantes
```

```
_premium
├── Contiene: Checkout + Menú + Home + Galería
├── Bloques disponibles: TODOS
└── Para: Restaurantes grandes
```

#### RELACIÓN:

- Componente (@saas/ui) — (importa y usa) —>
- Bloque (@saas/blocks) — (se importan en) —>
- Plantilla (apps/templates/_xyz/) — (se descarga y customiza como) —>
- Proyecto Cliente (pizzaya-weborder/)

## FLUJO DE INYECCIÓN (Cómo se customiza todo)

### CUANDO DESCARGAS EL ZIP, EL BACKEND HACE ESTO:

```json
{
  "template": "standard",
  "bloques": [
    "hero",
    "menu",
    "about",
    "cta"
  ],
  "config": {
    "name": "PizzaYa",
    "colors": {
      "primary": "#ff0000",
      "secondary": "#fff000"
    },
    "logo": "pizzaya-logo.png",
    "images": {
      "hero": "hero.jpg",
      "about": "about.jpg"
    }
  },
  "textos": {
    "hero": {
      "title": "Bienvenido a PizzaYa",
      "subtitle": "Las mejores pizzas de la ciudad"
    },
    "menu": {
      "title": "Nuestro Menú",
      "description": "Variedad de sabores"
    },
    "about": {
      "title": "Nuestra Historia",
      "content": "Cocinando con amor desde 1990"
    },
    "cta": {
      "title": "¿Listo para ordenar?",
      "button_text": "Haz tu pedido aquí"
    }
  }
}

```

#### Proceso de inyección:

1. **COLORES:** 
    1. Busca en master: apps/templates/_standard/tailwind.config.ts
    2. Reemplaza:
    primaryColor → #ff0000
    secondaryColor → #fff000
    3. Resultado: Nuevo tailwind.config.ts con colores de PizzaYa
2. **TEXTOS**
    1. Busca en master: apps/templates/_standard/src/app/page.tsx
    2. Reemplaza props en componentes: <HeroSimple title="DEFAULT" /> → <HeroSimple title="Bienvenido a PizzaYa" />
    3. Resultado: page.tsx con textos de PizzaYa
3. **IMÁGENES**
    1. Sube logo y hero a Cloudinary
    Obtiene URLs: https://res.cloudinary.com/.../logo.png
    2. Reemplaza en componentes: <Image src={require('@/public/logo.png')} /> → <Image src="https://cloudinary.com/.../logo.png" />
    3. Resultado: Componentes usando imágenes en cloud
    
    En caso que se quiera subir cloud se debera crear la instancia y configuarar primero, es recomendable que el .zip. Dejar eso como aclaracion
    
4. **BLOQUES NO USADOS**
    1. Seleccionaste: hero, menu, about, cta
    2. NO seleccionaste: contact, gallery, testimonials, offer, newsletter
    3. Elimina del ZIP:
    packages/blocks/contact/
    packages/blocks/gallery/
    packages/blocks/testimonials/
    packages/blocks/offer/
    packages/blocks/newsletter/
    4. Resultado: ZIP más pequeño (solo lo que necesitas)
5. **NOMBRE DEL PROYECTO**
    1. Edita en cada package.json:
    "name": "pizzaya-backend"
    "name": "pizzaya-web"
    "name": "pizzaya-admin"
    2. Resultado: Los nombres reflejan el cliente
6. **VARIABLES DE ENTORNO**
    1. Crea .env.local con:
    NEXT_PUBLIC_API_URL=https://pizzaya-backend.onrender.com
    NEXT_PUBLIC_TENANT_NAME=PizzaYa
    2. Resultado: Frontend sabe dónde está el backend
7. **CONFIGURACIÓN COMPARTIDA**
    1. Crea packages/configs/pizzaya.config.ts con:
        
        ```json
        export const config = {
        colors: { primary: "#ff0000", ... },
        name: "PizzaYa",
        ...
        }
        ```
        
    2. Resultado: Único lugar centralizado para customización

## MANTENIMIENTO Y UPDATES

---

## MANTENIMIENTO Y UPDATES

### Si hay CVE o cambios en el master

Master (appsbuilder) tiene actualización de seguridad.
Cambio: `packages/ui/Button.tsx` (fix de vulnerabilidad)

**IMPORTANTE:** El cliente (`pizzaya-weborder`) es un repo completamente independiente. No comparte historial con el master. El sync funciona agregando appsbuilder como remote externo y copiando solo los archivos que cambiaron — sin mergear historiales, sin conflictos por repos no relacionados.

Git es inteligente: solo modifica los archivos que efectivamente cambiaron en el master. El código del cliente (`apps/web/pizzaya/`) nunca se toca.

---

### OPCIÓN 1: Comandos manuales

```bash
cd pizzaya-weborder

# Primera vez: agregar appsbuilder como remote externo
git remote add appsbuilder https://github.com/tuuser/appsbuilder.git

# Fetchear contenido del master (no mergea nada, solo descarga)
git fetch appsbuilder

# Base siempre completa (presentes en todos los clientes)
git checkout appsbuilder/main -- packages/ui/
git checkout appsbuilder/main -- packages/utils/
git checkout appsbuilder/main -- packages/types/
git checkout appsbuilder/main -- packages/hooks/
git checkout appsbuilder/main -- packages/configs/

# Solo los bloques que ESTE cliente tiene
git checkout appsbuilder/main -- packages/blocks/hero/
git checkout appsbuilder/main -- packages/blocks/menu/
git checkout appsbuilder/main -- packages/blocks/about/
git checkout appsbuilder/main -- packages/blocks/cta/

git add packages/
git commit -m "sync: update packages from appsbuilder master"
git push origin main
```

---

### OPCIÓN 2: Script generado automáticamente por AppsBuilder (recomendada)

AppsBuilder incluye en el ZIP un script `sync-master.sh` generado con exactamente los bloques que el cliente seleccionó:

```bash
#!/bin/bash
# sync-master.sh — generado por AppsBuilder al crear el ZIP
# NO modificar manualmente

MASTER_REMOTE="appsbuilder"
MASTER_URL="https://github.com/tuuser/appsbuilder.git"
MASTER_BRANCH="main"

# Agregar remote si no existe todavía
if ! git remote get-url $MASTER_REMOTE > /dev/null 2>&1; then
  git remote add $MASTER_REMOTE $MASTER_URL
fi

# Fetchear contenido del master
git fetch $MASTER_REMOTE

# Base siempre completa
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/ui/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/utils/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/types/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/hooks/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/configs/

# Bloques seleccionados para este cliente
# (esta lista la genera AppsBuilder según la selección del wizard)
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/blocks/hero/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/blocks/menu/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/blocks/about/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/blocks/cta/

git add packages/
git commit -m "sync: update packages from appsbuilder master"
git push origin main
```

Para ejecutarlo:

```bash
cd pizzaya-weborder
chmod +x sync-master.sh
./sync-master.sh
```

---

### Resultado

- Solo se actualizan los archivos que cambiaron en el master (probado)
- `apps/web/pizzaya/` intacto — colores, textos e imágenes del cliente nunca se tocan
- Los repos siguen siendo independientes — appsbuilder es solo un remote externo
- El remote se puede remover después si se quiere: `git remote remove appsbuilder`

**Regla:** `packages/` nunca se modifica a mano en el cliente. Todo lo custom vive en `apps/web/{cliente}/`.

---

# AppsBuilder — Arquitectura Completa del Monorepo

> Documento basado en análisis real de proyectos existentes:
TokioSushis, CheepersTBH, Cheepers-Ecommerce, American-Way, UnToqueAhumado, Super-Milas-Online, DiamontNails
> 

---

## ÍNDICE

1. Estructura del Monorepo
2. Packages — Código Compartido
3. Apps — Builder UI
4. Apps — Productos
5. Jerarquía: Componente → Bloque → Plantilla
6. Frontend por Producto
7. Backend por Producto

---

## 1. ESTRUCTURA DEL MONOREPO

```
apps-builder/
│
├── packages/
│   ├── ui/                     @saas/ui
│   ├── blocks/                 @saas/blocks
│   ├── types/                  @saas/types
│   ├── hooks/                  @saas/hooks
│   ├── utils/                  @saas/utils
│   └── configs/                @saas/configs
│
├── apps/
│   ├── builder-ui/             ← LA HERRAMIENTA
│   ├── backend/                ← Express genérico base
│   ├── web-admin/              ← Admin genérico base
│   └── products/
│       ├── webOrders/          ← Delivery / Menú Digital
│       │   └── templates/
│       │       ├── _basic/
│       │       ├── _standard/
│       │       └── _premium/
│       ├── landingPages/       ← Landing Pages
│       │   └── templates/
│       │       ├── _basic/
│       │       ├── _standard/
│       │       └── _premium/
│       └── webInstitutional/   ← Webs Institucionales
│           └── templates/
│               ├── _basic/
│               ├── _standard/
│               └── _premium/
│
├── docs/
│   ├── GETTING_STARTED.md
│   ├── ARCHITECTURE.md
│   ├── BUILDER_GUIDE.md
│   └── TECH_STACK.md
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── .gitignore
```

---

## 2. PACKAGES

### 2.1 @saas/ui — Componentes Base

> Piezas pequeñas reutilizables al 100% en todos los productos y bloques.
Basado en los componentes encontrados en TokioSushis, CheepersTBH y American-Way.
> 

```
packages/ui/
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Stepper.tsx
│   ├── Skeleton.tsx
│   ├── Spinner.tsx
│   ├── Toast.tsx
│   └── index.ts
│
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PublicLayout.tsx
│   └── AdminLayout.tsx
│
├── admin/
│   ├── AdminCard.tsx
│   ├── AdminInput.tsx
│   ├── AdminTextarea.tsx
│   ├── AdminSelect.tsx
│   ├── AdminActionButtons.tsx
│   ├── AdminProductRow.tsx
│   ├── IconPickerModal.tsx
│   └── OrderItemList.tsx
│
├── hooks/
│   ├── useTheme.ts
│   ├── useMediaQuery.ts
│   └── index.ts
│
├── styles/
│   └── tailwind.css
│
├── index.ts
├── package.json
└── tsconfig.json
```

#### Button.tsx

```
Quién lo llama: Bloques (Hero, CTA, Menu), Admin forms, Checkout, Cart
Props:
  - variant: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' (default: 'default')
  - size: 'default' | 'sm' | 'lg' | 'icon' (default: 'default')
  - disabled: boolean
  - loading: boolean
  - onClick: () => void
  - children: ReactNode
  - className?: string
Estilos base: inline-flex items-center justify-center font-medium rounded-md transition-colors
              focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none
Variantes:
  default   → bg-primary text-white hover:bg-primary/90
  outline   → border border-primary hover:bg-primary/10
  secondary → bg-secondary text-foreground hover:bg-secondary/80
  ghost     → hover:bg-muted
  link      → text-primary underline
Tamaños:
  default → px-4 py-2.5 text-sm
  sm      → px-3 py-2 text-xs
  lg      → px-6 py-3 text-base
  icon    → h-9 w-9 p-0
Importado por: TODOS los bloques, forms de checkout y admin
```

#### Stepper.tsx

```
Quién lo llama: CartItemCard (blocks/cart)
Props:
  - value: number (requerido)
  - onIncrease: () => void (requerido)
  - onDecrease: () => void (requerido)
  - minValue?: number (default: 0)
  - size?: 'sm' | 'lg' (default: 'sm')
Render: <div> → <button> (Minus) + <span> + <button> (Plus)
Estilos: border border-white/10 bg-white/5
  sm: rounded-full p-1 gap-3
  lg: rounded-2xl p-2 gap-4
Estados:
  disabled → text-white/20 cursor-not-allowed (cuando value <= minValue)
  hover → bg-white/20
Librerías: lucide-react (Minus, Plus)
Importado por: blocks/cart/CartItemCard.tsx
```

#### Card.tsx

```
Quién lo llama: Bloques, Layouts, Admin
Props:
  - padding?: 'sm' | 'md' | 'lg' (default: 'md')
  - shadow?: boolean
  - borderRadius?: 'sm' | 'md' | 'lg' (default: 'md')
  - className?: string
  - children: ReactNode
Estilos base: bg-card border border-border
Importado por: blocks/menu/ProductCard, blocks/admin/*, blocks/checkout/*
```

#### Modal.tsx

```
Quién lo llama: blocks/checkout/MapPicker, blocks/checkout/DeliveryAddressWarningModal,
                blocks/menu/AddonsModal, blocks/admin/IconPickerModal
Props:
  - isOpen: boolean
  - onClose: () => void
  - children: ReactNode
  - size?: 'sm' | 'md' | 'lg' | 'fullscreen' (default: 'md')
  - title?: string
Render: Portal con overlay + contenedor centrado
Comportamiento: Escape para cerrar, click fuera cierra
```

#### AdminCard.tsx

```
Quién lo llama: Todos los tabs del admin
Props:
  - children: ReactNode
  - className?: string
  - variant: 'default' | 'inner' (default: 'default')
Estilos:
  default → bg-[#161616] border border-white/10 rounded-2xl p-5
  inner   → bg-[#1A1A1A] border border-white/10 rounded-xl p-4
```

#### AdminActionButtons.tsx

```
Quién lo llama: blocks/admin/MenuTab (por cada categoría, addon y producto)
Props:
  - active: boolean
  - onToggle: () => void
  - onEdit: () => void
  - onDelete: () => void
Render: 3 botones — Activar/Desactivar, Editar, Borrar
```

---

### 2.2 @saas/blocks — Bloques (Secciones Completas)

> Secciones completas enchufables. Cada bloque importa de @saas/ui.
Basado en features/ reales de TokioSushis, CheepersTBH y American-Way.
> 

```
packages/blocks/
│
├── hero/
│   ├── HeroSimple.tsx
│   ├── HeroWithCarousel.tsx
│   ├── HeroWithVideo.tsx
│   ├── index.ts
│   └── README.md
│
├── menu/
│   ├── MenuGrid.tsx
│   ├── MenuCarousel.tsx
│   ├── MenuList.tsx
│   ├── ProductCard.tsx
│   ├── ProductCardSkeleton.tsx
│   ├── CategoryFilter.tsx
│   ├── SearchBar.tsx
│   ├── FeaturedBanner.tsx
│   ├── StoreClosed.tsx
│   ├── AddonsModal.tsx
│   ├── index.ts
│   └── README.md
│
├── cart/
│   ├── CartItemCard.tsx
│   ├── CartItemHeader.tsx
│   ├── CartItemExtrasPanel.tsx
│   ├── CartEmpty.tsx
│   ├── index.ts
│   └── README.md
│
├── checkout/
│   ├── CheckoutForm.tsx
│   ├── SummarySection.tsx
│   ├── DeliveryTypeSelector.tsx
│   ├── AddressAutocomplete.tsx
│   ├── AddressMap.tsx
│   ├── MapPicker.tsx
│   ├── DeliveryCostPreview.tsx
│   ├── CouponSection.tsx
│   ├── DeliveryAddressWarningModal.tsx
│   ├── index.ts
│   └── README.md
│
├── admin/
│   ├── OverviewTab.tsx
│   ├── OrdersTab.tsx
│   ├── MenuTab.tsx
│   ├── CouponsTab.tsx
│   ├── GalleryTab.tsx
│   ├── ConfigTab.tsx
│   ├── QuickOrderForm.tsx
│   ├── index.ts
│   └── README.md
│
├── about/
│   ├── AboutSimple.tsx
│   ├── AboutWithStory.tsx
│   ├── index.ts
│   └── README.md
│
├── cta/
│   ├── CTASimple.tsx
│   ├── CTAWithCountdown.tsx
│   ├── index.ts
│   └── README.md
│
├── contact/
│   ├── ContactForm.tsx
│   ├── ContactInfo.tsx
│   ├── index.ts
│   └── README.md
│
├── gallery/
│   ├── GalleryGrid.tsx
│   ├── GalleryCarousel.tsx
│   ├── index.ts
│   └── README.md
│
├── testimonials/
│   ├── TestimonialsCarousel.tsx
│   ├── TestimonialsGrid.tsx
│   ├── index.ts
│   └── README.md
│
├── featured/
│   ├── FeaturedProducts.tsx
│   ├── index.ts
│   └── README.md
│
├── offer/
│   ├── OfferBanner.tsx
│   ├── CountdownOffer.tsx
│   ├── index.ts
│   └── README.md
│
├── newsletter/
│   ├── NewsletterForm.tsx
│   ├── index.ts
│   └── README.md
│
├── index.ts
├── package.json
└── tsconfig.json
```

#### blocks/hero/HeroSimple.tsx

```
Propósito: Sección hero estática con imagen de fondo + texto + CTA
Importa de @saas/ui: Button
Importa de @saas/hooks: useStoreStatus (opcional)
Props:
  - title: string
  - subtitle?: string
  - imageSrc: string
  - primaryColor: string
  - ctaText: string
  - ctaHref?: string
  - isOpen?: boolean
Render: Imagen fondo full-width + overlay + logo circular + badge abierto/cerrado + botón CTA
Quien lo importa: products/webOrders/templates/_standard/src/app/page.tsx
Reutilización: ~80% entre proyectos (solo cambia contenido)
```

#### blocks/hero/HeroWithCarousel.tsx

```
Propósito: Hero con slides auto-play y gestos touch
Importa de @saas/ui: Button
Props:
  - slides: HeroSlide[]  // { title, text, image, cta, ctaHref }
  - autoPlayMs?: number  // default: 6000
Render: Slides con imagen + texto + CTA, dots, arrows
Estado interno: current (slide actual), isTransitioning (bloqueo durante transición)
Comportamiento: auto-play configurable, touch swipe 75px threshold, 900ms transición
Quien lo importa: products/webOrders/templates/_premium, landingPages/templates/*
Librerías: lucide-react (ChevronLeft, ChevronRight)
```

#### blocks/menu/ProductCard.tsx

```
Propósito: Card de producto individual con botón agregar al carrito
Importa de @saas/ui: Button, Badge
Importa de @saas/hooks: useCartStore
Importa de @saas/utils: formatPrice, cloudinaryImage
Props:
  - product: Product
  - isStoreOpen: boolean
  - variant?: 'horizontal' | 'vertical' (default: 'horizontal')
  - priority?: boolean
Estado interno: imageError (boolean)
Lógica: isButtonDisabled = !isStoreOpen || !product.available || isOutOfStock
Manejo imagen: fallback a emoji 🍣 si error
Variante horizontal: texto izquierda + imagen 88x88 (TokioSushis style)
Variante vertical: imagen aspect-[4/3] + texto abajo (AmericanWay style)
Quien lo importa: blocks/menu/MenuGrid, blocks/menu/MenuCarousel, blocks/menu/MenuList
```

#### blocks/menu/CategoryFilter.tsx

```
Propósito: Barra horizontal scrollable de categorías
Importa de @saas/ui: Button
Importa de @saas/utils: getCategoryIcon
Props:
  - categories: Category[]
  - selectedCategory: string | null
  - onSelectCategory: (id: string | null) => void
Estado interno: scrollRef, showLeftArrow, showRightArrow
Comportamiento: Al seleccionar → scroll a #product-list-top
Responsive: sticky en mobile
Librerías: lucide-react (ChevronLeft, ChevronRight)
Quien lo importa: products/webOrders/templates/*/src/app/page.tsx
```

#### blocks/menu/SearchBar.tsx

```
Propósito: Input de búsqueda con debounce
Importa de @saas/ui: Input
Props:
  - searchQuery: string
  - onSearch: (query: string) => void
  - placeholder?: string
Estado interno: localSearch con debounce 300ms
Librerías: lucide-react (Search, X)
Quien lo importa: blocks/menu/FeaturedBanner (integrado) o como componente separado
```

#### blocks/menu/AddonsModal.tsx

```
Propósito: Modal para seleccionar adicionales al agregar producto
Importa de @saas/ui: Modal, Button, Stepper
Props:
  - product: Product
  - isOpen: boolean
  - onClose: () => void
  - onConfirm: (addons: SelectedAddon[]) => void
Estado interno: selectedAddons
Quien lo importa: blocks/menu/MenuGrid (en CheepersTBH style)
```

#### blocks/cart/CartItemCard.tsx

```
Propósito: Item del carrito con stepper y panel de adicionales
Importa de @saas/ui: Stepper
Importa de @saas/blocks/cart: CartItemHeader, CartItemExtrasPanel
Importa de @saas/hooks: useCartStore
Importa de @saas/utils: formatPrice
Props:
  - item: CartItem
  - index: number
Estado interno: isRemoving, imageError, showExtras, prevSignature (DNA para stale state)
Lógica:
  - DNA signature: detecta cambios en addons para resetear estado
  - handleRemove: animación 300ms → removeItem
  - handleDecrease: si qty=1 → removeItem
Librerías: lucide-react (Trash2)
Quien lo importa: products/webOrders/templates/*/src/app/cart/page.tsx
```

#### blocks/checkout/CheckoutForm.tsx

```
Propósito: Formulario de datos del cliente (nombre, teléfono, notas)
Importa de @saas/ui: Input, Textarea, Card
Props:
  - name, phone, notes: string
  - onNameChange, onPhoneChange, onNotesChange: (v: string) => void
Restricciones: notas max 60 chars, solo letras y espacios
Quien lo importa: products/webOrders/templates/*/src/app/checkout/page.tsx
```

#### blocks/checkout/DeliveryTypeSelector.tsx

```
Propósito: Selector entre envío a domicilio y retiro en local
Importa de @saas/hooks: useCartStore
Render: 2 botones grandes — Bike icon (delivery) + Store icon (pickup)
Indicador activo: dot circular con color primary
Librerías: lucide-react (Bike, Store)
Quien lo importa: products/webOrders/templates/*/src/app/checkout/page.tsx
```

#### blocks/checkout/AddressAutocomplete.tsx

```
Propósito: Input de dirección con autocompletado Mapbox y selector de mapa
Importa de @saas/hooks: useAddressSearch
Importa de @saas/blocks/checkout: MapPicker
Props:
  - value: string
  - onChange: (result: AddressResult) => void
  - onClear: () => void
  - placeholder?: string
Estado interno: inputValue, isOpen (dropdown), isSelected, isMapOpen
Comportamiento:
  - Mínimo 4 chars para buscar
  - Dropdown con resultados Mapbox
  - Fallback "Usar esta dirección"
  - Botón para abrir MapPicker
Quien lo importa: products/webOrders/templates/*/src/app/checkout/page.tsx
Solo si: producto seleccionado es webOrders Y tiene módulo delivery habilitado
```

#### blocks/checkout/MapPicker.tsx

```
Propósito: Modal full-screen para seleccionar ubicación en mapa Mapbox
Importa de @saas/ui: Modal, Button
Props:
  - isOpen: boolean
  - onClose: () => void
  - onSelectCoordinates: (lat, lng, placeName) => void
  - initialLat?: number
  - initialLng?: number
Comportamiento:
  - Mapa oscuro con marcador draggable
  - Click para mover marcador
  - Reverse geocode al confirmar
Librerías: mapbox-gl
Quien lo importa: blocks/checkout/AddressAutocomplete.tsx
```

#### blocks/checkout/SummarySection.tsx

```
Propósito: Resumen de items, subtotal, descuentos y total
Importa de @saas/ui: Card
Importa de @saas/utils: formatPrice
Props:
  - items: CartItem[]
  - subtotal, discount, surcharge, total: number
  - deliveryType: 'delivery' | 'pickup'
  - isDeliveryLoading: boolean
Estado interno: mounted (para evitar hydration issues)
Render: lista items + fila subtotal + fila descuento (verde) + fila envío + fila recargo crédito (naranja) + total
Quien lo importa: products/webOrders/templates/*/src/app/checkout/page.tsx
```

#### blocks/about/AboutSimple.tsx

```
Propósito: Sección "Sobre nosotros" con texto e imagen
Importa de @saas/ui: Card
Props:
  - title: string
  - description: string
  - imageSrc?: string
  - primaryColor: string
Quien lo importa: products/webOrders/templates/_standard, products/webInstitutional/templates/*
```

#### blocks/cta/CTASimple.tsx

```
Propósito: Sección de llamada a la acción
Importa de @saas/ui: Button
Props:
  - title: string
  - subtitle?: string
  - buttonText: string
  - buttonHref?: string
  - buttonColor?: string
Estilos: Fondo con color primary, botones outlined
Quien lo importa: products/webOrders/templates/_standard, products/landingPages/templates/*
```

#### blocks/admin/OverviewTab.tsx

```
Propósito: Dashboard principal del admin con métricas
Importa de @saas/ui: AdminCard
Importa de @saas/hooks: useAdminOverview, useAdminOrders, useAdminMenu, useAdminCoupons
Render:
  - 7 KPI cards (total, efectivo, débito, crédito, transferencia, entregados, top producto)
  - Selector de rango (hoy/ayer/semana/mes)
  - Pedidos recientes (6)
  - Productos + cupones lado a lado
  - Botón panic (cierre de emergencia)
Quien lo importa: apps/web-admin/src/app/admin/page.tsx
```

#### blocks/admin/OrdersTab.tsx

```
Propósito: Panel de gestión de pedidos
Importa de @saas/ui: AdminCard, AdminActionButtons
Importa de @saas/hooks: useAdminOrders
Render:
  - Filtros de estado con conteos
  - QuickOrderForm (pedido rápido manual)
  - Lista de pedidos expandibles
  - Print comanda (HTML para impresora)
  - WhatsApp link para notificar
Quien lo importa: apps/web-admin/src/app/admin/page.tsx
```

#### blocks/admin/MenuTab.tsx

```
Propósito: CRUD de categorías, adicionales y productos
Importa de @saas/ui: AdminCard, AdminInput, AdminTextarea, AdminSelect, AdminActionButtons, AdminProductRow, IconPickerModal
Importa de @saas/hooks: useAdminMenu, useAdminCrud
Render:
  - Sección Categorías (nombre + ícono)
  - Sección Addons (nombre + precio + categorías asociadas)
  - Sección Productos (form completo + lista filtrada)
Quien lo importa: apps/web-admin/src/app/admin/page.tsx
```

#### blocks/admin/ConfigTab.tsx

```
Propósito: Configuración general del negocio
Importa de @saas/ui: AdminCard, AdminInput
Importa de @saas/hooks: useAdminConfig
Secciones:
  - EmergencySection: botón panic
  - ScheduleSection: 7 días con horarios
  - BannerSection: URL de banner + preview
  - RainSection: toggle lluvia + costo extra
  - RangesSection: rangos km/precio de delivery
Quien lo importa: apps/web-admin/src/app/admin/page.tsx
```

---

### 2.3 @saas/types — Tipos TypeScript

```
packages/types/
├── product.ts
├── category.ts
├── addon.ts
├── cart.ts
├── order.ts
├── coupon.ts
├── delivery.ts
├── analytics.ts
├── config.ts
├── api.ts
├── user.ts
├── index.ts
├── package.json
└── tsconfig.json
```

#### Tipos principales

```tsx
// product.ts
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  featured: boolean;
  order: number;
  addons?: Addon[];
  controlStock?: boolean;
  stock?: number;
  promotionalLabel?: string;
}

// cart.ts
interface CartItem {
  product: Product;
  quantity: number;
  addons: CartAddon[];
  itemTotal: number;
  cartItemId: string;  // productId__addonId1:qty1,...
}

interface CartAddon {
  addon: Addon;
  quantity: number;
}

// order.ts
interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; phone: string };
  items: OrderItem[];
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryCoordinates?: { lat: number; lng: number };
  deliveryCost: number;
  paymentMethod: string;
  coupon?: Coupon;
  subtotal: number;
  discount: number;
  surcharge: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: Date;
}
```

---

### 2.4 @saas/hooks — Hooks Reutilizables

```
packages/hooks/
├── useMenu.ts
├── useCartStore.ts
├── useAuthStore.ts
├── useStoreStatus.ts
├── useCheckout.ts
├── useDelivery.ts
├── useAddressSearch.ts
├── useAdminCrud.ts
├── useAdminOrders.ts
├── useAdminMenu.ts
├── useAdminConfig.ts
├── useAdminOverview.ts
├── useAdminCoupons.ts
├── useAdminGallery.ts
├── useQuickOrder.ts
├── index.ts
├── package.json
└── tsconfig.json
```

#### useMenu.ts

```
Retorna: { products, categories, loading, error, selectedCategory, filteredProducts, selectCategory, setSearch, searchQuery }
Lógica:
  1. Cache en sessionStorage con TTL 5 minutos
  2. Mount: si hay cache → mostrar + refetch silencioso
  3. Refetch en visibilitychange si cache venció
  4. Filtrado por categoría + búsqueda (useMemo)
  5. Promise.all paralelo: productos + categorías + addons
  6. Merge de addons por producto
Dependencias: menuService (services/menu.service.ts)
Importado por: blocks/menu/*, products/webOrders/templates/*/page.tsx
```

#### useCartStore.ts (Zustand)

```
Persistencia: localStorage con key configurable por proyecto
Estado:
  - items: CartItem[]
  - deliveryType: 'pickup' | 'delivery'
  - paymentMethod: string | null
  - coupon: Coupon | null
  - deliveryAddress: string
  - deliveryCoordinates: { lat, lng } | null
  - distanceKm: number
  - deliveryCost: number
Acciones:
  - addItem(product, quantity, addons)  → fusiona si mismo producto+addons
  - removeItem(index)
  - updateQuantity(index, quantity)
  - updateItemAddon(itemIndex, addon, delta)  → split si qty>1
  - clearCart()
  - setDeliveryType / setPaymentMethod / setCoupon / clearCoupon
  - setDeliveryAddress / setDeliveryCost / clearDelivery
Computed:
  - getTotals() → { subtotal, discount, surcharge, total, itemCount }
  - Recargo 15% si paymentMethod === 'credito'
Importado por: blocks/menu/ProductCard, blocks/cart/*, blocks/checkout/*
```

#### useCheckout.ts

```
Propósito: Orquestador principal del checkout
Retorna: {
  items, deliveryType, paymentMethod, coupon,
  name, phone, notes + setters,
  couponCode, couponLoading, couponError, validateCoupon,
  submitting, submitError, isConfirmDisabled, handleConfirmOrder,
  unresolvedAddressModal, confirmUnresolvedDelivery, cancelUnresolvedDelivery,
  subtotal, discount, surcharge, total
}
Flujo handleConfirmOrder:
  1. Valida campos obligatorios
  2. Si delivery sin coordenadas → modal advertencia
  3. POST /orders
  4. sessionStorage.setItem('order_confirmation', ...)
  5. router.push('/order-confirmation')
  6. clearCart (100ms delay)
Importado por: products/webOrders/templates/*/src/app/checkout/page.tsx
```

#### useDelivery.ts

```
Propósito: Cálculo reactivo de costo de envío
Watch: deliveryCoordinates + deliveryType del cart store
Llama: deliveryService.calculateDeliveryCost
Éxito → setDeliveryCost en store
Error → limpia costo a 0
Importado por: blocks/checkout/DeliveryCostPreview
```

#### useAdminCrud.ts (Genérico)

```tsx
function useAdminCrud<TForm, TItem>(opts: {
  blank: () => TForm;
  create: (data: TForm) => Promise<void>;
  update: (id: string, data: TForm) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggle?: (id: string) => Promise<void>;
  reload: () => Promise<void>;
  toPayload?: (form: TForm) => any;
  fromItem: (item: TItem) => TForm;
  getId?: (item: TItem) => string;
}): {
  form, setForm, editId, err,
  save, edit, remove, toggle, cancel
}
Importado por: useAdminMenu, useAdminCoupons
```

---

### 2.5 @saas/utils — Funciones Compartidas

```
packages/utils/
├── format.ts
├── distance.ts
├── timezone.ts
├── image.ts
├── categoryIcons.ts
├── comanda.ts
├── validation.ts
├── constants.ts
├── index.ts
├── package.json
└── tsconfig.json
```

#### format.ts

```tsx
// Funciones encontradas en TODOS los proyectos
formatPrice(price: number): string          // → "$1.200"
formatDistance(km: number): string          // → "2.5 km"
formatOrderNumber(num: string): string      // → "#0042"
formatDate(date: Date, timezone?: string): string
formatTime(date: Date): string
```

#### image.ts

```tsx
// Cloudinary URL optimizer
cloudinaryImage(url: string, width?: number): string
// Agrega: f_auto,q_auto,w_{width} a la URL de Cloudinary
```

#### categoryIcons.ts

```tsx
// Mapeo categorías → íconos Lucide (de TokioSushis)
getCategoryIcon(categoryName: string): LucideIcon
CATEGORY_ICON_OPTIONS: { name: string; icon: LucideIcon }[]
```

#### distance.ts

```tsx
// Cálculo Haversine (del backend de TokioSushis)
haversineDistance(lat1, lng1, lat2, lng2): number  // en km
```

---

### 2.6 @saas/configs — Configuraciones

```
packages/configs/
├── base.config.ts
├── featureFlags.ts
├── utils.ts
├── index.ts
├── package.json
└── tsconfig.json
```

#### base.config.ts

```tsx
// Configuración inyectada por AppsBuilder al generar el ZIP
export interface ProjectConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo: string;            // URL Cloudinary
  favicon: string;         // URL Cloudinary
  whatsapp?: string;
  instagram?: string;
  address?: string;
  mapboxToken?: string;    // Solo si tiene delivery
}
```

---

## 3. BUILDER UI

```
apps/builder-ui/
├── pages/
│   ├── index.tsx                  ← Home / selector de producto
│   ├── builder/
│   │   ├── index.tsx              ← Paso 1: elegir producto
│   │   ├── [step].tsx             ← Pasos 2-8 dinámicos
│   │   └── layout.tsx             ← Layout del wizard
│   └── api/
│       └── generate-repo.ts       ← Backend generador de ZIP
│
├── components/
│   ├── ProductSelector.tsx
│   ├── TemplateSelector.tsx
│   ├── BloqueCheckbox.tsx
│   ├── ColorPicker.tsx
│   ├── FontSelector.tsx
│   ├── TextEditor.tsx
│   ├── ImageUploader.tsx
│   ├── PreviewPanel.tsx
│   ├── StepIndicator.tsx
│   └── DownloadButton.tsx
│
├── stores/
│   └── builderStore.ts            ← Zustand: toda la config del wizard
│
├── hooks/
│   ├── useProductBlocks.ts        ← Qué bloques tiene cada producto
│   └── useFormValidation.ts
│
├── lib/
│   ├── generator/
│   │   ├── index.ts               ← Orquestador principal
│   │   ├── fileProcessor.ts       ← Leer archivos del master
│   │   ├── injector.ts            ← Inyectar colores, textos, imágenes
│   │   ├── cleaner.ts             ← Eliminar bloques no usados
│   │   └── zipCreator.ts          ← Crear ZIP en memoria
│   ├── cloudinary.ts              ← Subir imágenes
│   ├── api.ts                     ← Fetch al generate-repo
│   ├── validators.ts
│   └── constants.ts               ← Productos, bloques disponibles, etc.
│
├── styles/
│   └── globals.css
│
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

#### builderStore.ts

```tsx
interface BuilderState {
  // Paso 1
  product: 'webOrders' | 'landingPages' | 'webInstitutional' | null;
  // Paso 2
  template: 'basic' | 'standard' | 'premium' | null;
  // Paso 3
  selectedBlocks: string[];
  // Paso 4
  config: {
    name: string;
    colors: { primary: string; secondary: string; accent: string };
    fonts: { heading: string; body: string };
    logo: File | null;
    favicon: File | null;
  };
  // Paso 5
  textos: Record<string, Record<string, string>>;
  // Paso 6
  imagenes: Record<string, File | null>;
  // Setters
  setProduct / setTemplate / setSelectedBlocks / setConfig / setTextos / setImagenes
}
```

#### generate-repo.ts (API Route)

```
Recibe: BuilderState completo
Flujo:
  1. Valida input con Zod
  2. Lee archivos del master desde GitHub (raw.githubusercontent.com)
  3. Copia estructura del producto + plantilla seleccionada
  4. Elimina bloques NO seleccionados (cleaner.ts)
  5. Inyecta colores en tailwind.config.ts (injector.ts)
  6. Reemplaza textos en componentes (injector.ts)
  7. Sube imágenes a Cloudinary → obtiene URLs (cloudinary.ts)
  8. Reemplaza URLs en componentes (injector.ts)
  9. Edita package.json (nombre del proyecto)
  10. Crea .env.local con variables
  11. Crea packages/configs/{name}.config.ts
  12. Comprime en ZIP (zipCreator.ts)
  13. Retorna descarga automática
Stack:
  - JSZip (ZIP en memoria)
  - Sharp (optimización imágenes)
  - Cloudinary SDK
  - Zod (validación)
```

---

## 4. PRODUCTOS

### 4.1 webOrders — Menú Digital / Delivery

```
apps/products/webOrders/
├── templates/
│   ├── _basic/
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx          ← Solo Menu
│   │   │       ├── cart/page.tsx
│   │   │       ├── checkout/page.tsx
│   │   │       └── order-confirmation/page.tsx
│   │   ├── public/
│   │   ├── .env.local.example
│   │   ├── vercel.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── _standard/
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx          ← Home con bloques configurados
│   │   │       ├── cart/page.tsx
│   │   │       ├── checkout/page.tsx
│   │   │       ├── order-confirmation/page.tsx
│   │   │       ├── admin/page.tsx
│   │   │       └── login/page.tsx
│   │   ├── public/
│   │   │   ├── logos/
│   │   │   └── images/
│   │   ├── .env.local.example
│   │   ├── vercel.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── _premium/
│       └── (misma estructura + bloques gallery, testimonials, etc.)
│
└── README.md
```

#### page.tsx del template _standard (ejemplo después de inyección)

```tsx
// Este archivo es GENERADO por AppsBuilder con los bloques seleccionados
// Ejemplo para cliente "PizzaYa" con bloques: Hero + Menu + About + CTA

import { HeroSimple }      from '@saas/blocks/hero'
import { MenuGrid, CategoryFilter, SearchBar } from '@saas/blocks/menu'
import { AboutSimple }     from '@saas/blocks/about'
import { CTASimple }       from '@saas/blocks/cta'
import Header              from '@/components/layout/Header'
import Footer              from '@/components/layout/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <HeroSimple
        title="Bienvenido a PizzaYa"
        subtitle="Las mejores pizzas del barrio"
        imageSrc="https://res.cloudinary.com/.../hero.jpg"
        primaryColor="#ff0000"
        ctaText="Ver menú"
        ctaHref="#menu"
      />
      <MenuGrid columns={3} primaryColor="#ff0000" />
      <AboutSimple
        title="Nuestra Historia"
        description="Somos un pequeño restaurante..."
        imageSrc="https://res.cloudinary.com/.../about.jpg"
        primaryColor="#ff0000"
      />
      <CTASimple
        title="¿Listo para ordenar?"
        buttonText="Haz tu pedido ahora"
        buttonColor="#ff0000"
      />
      <Footer />
    </>
  )
}

// NOTA: Los bloques NO seleccionados (Gallery, Testimonials, Newsletter, etc.)
// NO están en este archivo Y NO están en packages/blocks/ del ZIP descargado.
// Arquitectura preparada para importarlos si se necesitan después.
```

#### Bloques disponibles por plantilla (webOrders)

```
_basic:
  - Menu (obligatorio siempre)

_standard:
  - Menu (obligatorio)
  - Hero
  - Featured
  - About
  - CTA
  - Contact

_premium:
  - Menu (obligatorio)
  - Hero
  - Featured
  - About
  - CTA
  - Contact
  - Gallery
  - Testimonials
  - Offer
  - Newsletter
```

### 4.2 landingPages — Landing Pages

```
apps/products/landingPages/
├── templates/
│   ├── _basic/
│   │   └── src/app/
│   │       └── page.tsx  ← Hero + CTA
│   ├── _standard/
│   │   └── src/app/
│   │       └── page.tsx  ← Hero + Features + Pricing + CTA
│   └── _premium/
│       └── src/app/
│           └── page.tsx  ← Hero + Features + Pricing + Testimonials + FAQ + Newsletter
└── README.md
```

#### Bloques disponibles (landingPages) — A DESARROLLAR

```
_basic:
  - Hero

_standard:
  - Hero
  - Features
  - Pricing
  - CTA

_premium:
  - Hero
  - Features
  - Pricing
  - Testimonials
  - FAQ
  - CTA
  - Newsletter
```

> NOTA: Los bloques de landingPages reutilizan @saas/ui al 100%.
Los bloques específicos (Features, Pricing, FAQ) serán nuevos en @saas/blocks.
> 

### 4.3 webInstitutional — Webs Institucionales

```
apps/products/webInstitutional/
├── templates/
│   ├── _basic/
│   │   └── src/app/
│   │       └── page.tsx  ← Hero + Contact
│   ├── _standard/
│   │   └── src/app/
│   │       └── page.tsx  ← Hero + Services + About + Contact
│   └── _premium/
│       └── src/app/
│           └── page.tsx  ← Hero + Services + About + Team + Gallery + Contac
└── README.md
```

---

## 5. JERARQUÍA

```
@saas/ui (Componente base)
  └── 100% reutilizable en TODOS los productos
  └── Ejemplos: Button, Card, Input, Modal, Stepper, Badge, AdminCard
  └── NUNCA contiene lógica de negocio, solo UI pura

        ↓ importado por

@saas/blocks (Bloque = Sección completa)
  └── 60-80% reutilizable según el tipo de bloque
  └── Importa de @saas/ui + @saas/hooks + @saas/utils
  └── Puede importar otros bloques (ej: MenuGrid → ProductCard)
  └── Contiene lógica de negocio (carrito, checkout, admin)
  └── Ejemplos: HeroSimple, MenuGrid, CartItemCard, CheckoutForm

        ↓ importado por

Plantilla (apps/products/*/templates/_standard)
  └── Específica para cada tipo de producto
  └── Página principal (page.tsx) que orquesta bloques
  └── Los bloques se inyectan según selección en AppsBuilder
  └── La arquitectura queda COMPLETA aunque no todos los bloques estén seleccionados
      → Se pueden importar manualmente después

        ↓ generado como

Proyecto Cliente (pizzaya-weborder.zip)
  └── Monorepo independiente
  └── Solo contiene los bloques seleccionados en packages/blocks/
  └── packages/ui/ SIEMPRE completo
  └── packages/utils/ SIEMPRE completo
  └── .env con variables del cliente
  └── Listo para deployar en 30 minutos
```

### Reglas de importación permitidas

```
Plantilla  → puede importar Bloques y Componentes
Bloque     → puede importar Componentes y otros Bloques
Componente ↔ puede importar otros Componentes
```

---

## 6. FRONTEND POR PRODUCTO (ZIP descargado)

### webOrders — Frontend (pizzaya-web)

```
pizzaya-weborder/
├── packages/               ← Código compartido
│   ├── ui/
│   ├── blocks/             ← SOLO los bloques seleccionados
│   │   ├── hero/           ← Si se seleccionó Hero
│   │   ├── menu/           ← SIEMPRE (obligatorio por el producto)
│   │   ├── about/          ← Si se seleccionó About
│   │   └── cta/            ← Si se seleccionó CTA
│   ├── types/
│   ├── hooks/
│   ├── utils/
│   └── configs/
│       └── pizzaya.config.ts  ← Colores y config inyectados
│
├── apps/
│   ├── web/pizzaya/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx                  ← Home generado
│   │   │   │   ├── cart/page.tsx
│   │   │   │   ├── checkout/page.tsx
│   │   │   │   ├── order-confirmation/page.tsx
│   │   │   │   ├── admin/page.tsx
│   │   │   │   └── login/page.tsx
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   └── PublicLayout.tsx
│   │   │   │   └── sections/
│   │   │   │       ├── HeroSection.tsx       ← wrapper de @saas/blocks/hero
│   │   │   │       ├── MenuSection.tsx       ← wrapper de @saas/blocks/menu
│   │   │   │       └── CTASection.tsx        ← wrapper de @saas/blocks/cta
│   │   │   ├── services/
│   │   │   │   ├── api.ts
│   │   │   │   ├── menu.service.ts
│   │   │   │   └── delivery.service.ts
│   │   │   ├── stores/
│   │   │   │   ├── cart.store.ts
│   │   │   │   └── auth.store.ts
│   │   │   ├── styles/
│   │   │   │   └── globals.css               ← CSS vars inyectadas
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── public/
│   │   │   ├── logos/pizzaya.png             ← Logo inyectado
│   │   │   └── images/                       ← Mantener o por Cloudinary
│   │   │       ├── hero.jpg                  ← Imagen inyectada
│   │   │       └── about.jpg                 ← Imagen inyectada
│   │   ├── .env.local                        ← Variables inyectadas
│   │   ├── vercel.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts                ← Colores inyectados
│   │   ├── package.json                      ← name: "pizzaya-web"
│   │   └── tsconfig.json
│   │
│   ├── backend/
│   │   └── (ver sección 7)
│   │
│   └── web-admin/
│       ├── src/
│       │   ├── app/
│       │   │   └── admin/page.tsx            ← Admin con tabs
│       │   ├── features/admin/
│       │   ├── stores/
│       │   └── services/
│       ├── .env.local
│       ├── vercel.json
│       └── package.json                      ← name: "pizzaya-admin"
│
├── .env                    ← Raíz para desarrollo local
├── package.json            ← name: "pizzaya-weborder"
├── pnpm-workspace.yaml
├── turbo.json
├── README.md               ← Instrucciones de deploy generadas
└── .gitignore
```

#### Variables de entorno inyectadas (.env.local)

```bash
# Frontend
NEXT_PUBLIC_API_URL=https://pizzaya-backend.onrender.com
NEXT_PUBLIC_TENANT_NAME=PizzaYa
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx      # Solo si tiene delivery con Mapbox

# Backend
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pizzaya
JWT_SECRET=REEMPLAZAR_CON_SECRET_SEGURO
CLOUDINARY_CLOUD_NAME=REEMPLAZAR
CLOUDINARY_API_KEY=REEMPLAZAR
CLOUDINARY_API_SECRET=REEMPLAZAR
MAPBOX_TOKEN=sk.xxx                  # Solo si tiene delivery
PORT=4000
```

#### tailwind.config.ts inyectado

```tsx
// Generado por AppsBuilder con los colores del cliente
export default {
  theme: {
    extend: {
      colors: {
        primary: '#ff0000',     // ← inyectado
        secondary: '#fff000',   // ← inyectado
        accent: '#333333',      // ← inyectado
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],   // ← inyectado
      }
    }
  }
}
```

---

## 7. BACKEND POR PRODUCTO (ZIP descargado)

### webOrders — Backend (pizzaya-backend)

> Base: apps/backend/ del master. TODOS los productos deben tener un Backend si y solo si tienen un bloque que lo necesite
> 

```
# Ejemplo de Backend completo (no necesariamente todos deben lucir asi)

apps/backend/
├── src/
│   ├── modules/
│   │   ├── Schedules/                ← Config negocio + horarios + estado abierto
│   │   │   ├── schedule.controller.ts
│   │   │   ├── schedule.service.ts
│   │   │   ├── schedule.routes.ts
│   │   │   └── schedule.model.ts
│   │   │
│   │   ├── products/
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.routes.ts
│   │   │   └── products.model.ts
│   │   │
│   │   ├── categories/
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── categories.routes.ts
│   │   │   └── categories.model.ts
│   │   │
│   │   ├── adicionales/
│   │   │   ├── adicionales.controller.ts
│   │   │   ├── adicionales.service.ts
│   │   │   ├── adicionales.routes.ts
│   │   │   └── adicionales.model.ts
│   │   │
│   │   ├── orders/
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   ├── orders.routes.ts
│   │   │   └── orders.model.ts
│   │   │
│   │   ├── delivery/
│   │   │   ├── delivery.controller.ts
│   │   │   ├── delivery.service.ts     ← Mapbox distance API + Haversine
│   │   │   └── delivery.routes.ts
│   │   │
│   │   ├── coupons/
│   │   │   ├── coupons.controller.ts
│   │   │   ├── coupons.service.ts
│   │   │   ├── coupons.routes.ts
│   │   │   └── coupons.model.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── analytics.routes.ts
│   │   │
│   │   ├── gallery/
│   │   │   ├── gallery.controller.ts   ← Cloudinary upload/delete
│   │   │   ├── gallery.service.ts
│   │   │   ├── gallery.routes.ts
│   │   │   └── gallery.model.ts
│   │   │
│   │   ├── geocoding/
│   │   │   ├── geocoding.controller.ts ← Proxy a Google Geocoding API
│   │   │   └── geocoding.routes.ts
│   │   │
│   │   └── users/
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       ├── users.routes.ts
│   │       └── users.model.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts          ← JWT verify
│   │   ├── error.middleware.ts         ← Global error handler
│   │   ├── logger.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   └── validate.middleware.ts      ← Zod validation
│   │
│   ├── utils/
│   │   ├── AppError.ts                 ← Custom error class
│   │   ├── asyncHandler.ts             ← Async wrapper
│   │   ├── crudFactory.ts              ← Factory de CRUD genérico
│   │   ├── dateRange.ts
│   │   ├── distance.ts                 ← Haversine (importa @saas/utils)
│   │   ├── timezone.ts                 ← Argentina timezone
│   │   ├── response.ts                 ← Helpers de response
│   │   └── generateComandaHTML.ts      ← HTML para impresora
│   │
│   ├── config/
│   │   ├── db.ts                       ← MongoDB connection
│   │   ├── config.ts                   ← Variables de entorno
│   │   └── env.ts
│   │
│   ├── routes/
│   │   └── index.ts                    ← Monta todos los módulos
│   │
│   ├── socket/
│   │   └── socket.ts                   ← Socket.io (órdenes en tiempo real)
│   │
│   ├── app.ts                          ← Setup Express + middlewares
│   └── server.ts                       ← Entry point
│
├── .env                                ← Variables inyectadas
├── .env.example
├── render.yaml                         ← Config deploy Render
├── package.json                        ← name: "pizzaya-backend"
└── tsconfig.json
```

#### Endpoints del backend (webOrders)

```
PÚBLICOS (sin auth):
  GET    /api/products/public        ← Productos activos
  GET    /api/categories             ← Categorías activas
  GET    /api/addons                 ← Adicionales (filtro por categoría)
  GET    /api/config/status          ← Estado abierto/cerrado + banner
  POST   /api/orders                 ← Crear pedido
  POST   /api/coupons/validate/:code ← Validar cupón
  POST   /api/delivery/calculate     ← Calcular costo de envío
  POST   /api/geocoding              ← Reverse geocoding (proxy Google)

ADMIN (requieren JWT):
  GET    /api/products               ← Todos los productos
  POST   /api/products               ← Crear producto
  PUT    /api/products/:id           ← Actualizar producto
  DELETE /api/products/:id           ← Eliminar producto

  GET    /api/categories             ← Todas las categorías
  POST   /api/categories
  PUT    /api/categories/:id
  DELETE /api/categories/:id

  GET    /api/addons
  POST   /api/addons
  PUT    /api/addons/:id
  DELETE /api/addons/:id

  GET    /api/orders                 ← Listado de pedidos
  GET    /api/orders/admin           ← Pedidos admin (con rango de fecha)
  PUT    /api/orders/admin/:id/status← Actualizar estado del pedido
  DELETE /api/orders/:id

  GET    /api/config                 ← Config completa del negocio
  PUT    /api/config/status          ← Toggle emergencia
  PUT    /api/config/schedule        ← Guardar horarios
  PUT    /api/config/banner          ← Guardar banner
  PATCH  /api/config/rain            ← Toggle lluvia
  POST   /api/config/delivery/range  ← Agregar rango km
  DELETE /api/config/delivery/range/:id

  GET    /api/analytics              ← Métricas por rango
  GET    /api/gallery                ← Galería de imágenes
  POST   /api/gallery
  DELETE /api/gallery/:id
  GET    /api/coupons
  POST   /api/coupons
  PUT    /api/coupons/:id
  DELETE /api/coupons/:id

  POST   /api/users/login            ← Login admin
  GET    /api/health                 ← Health check
```

---

## DOCS

```
docs/
├── GETTING_STARTED.md    ← Cómo usar AppsBuilder para generar un proyecto
├── ARCHITECTURE.md       ← Este documento
├── BUILDER_GUIDE.md      ← Guía paso a paso del wizard
├── TECH_STACK.md         ← Stack tecnológico detallado
└── ROLLOUT_PLAN.md       ← Plan de rollout por producto (gastro → landing → inst.)
```

---

## GIT & ACTUALIZACIONES

```
ESTRATEGIA MVP (actual):
  1. El ZIP descargado es un repo INDEPENDIENTE
  2. No tiene vinculación con el master
  3. Si hay CVE o mejora en el master:
     → Regenerar con AppsBuilder (misma config)
     → Mergear cambios manualmente con git

ESTRATEGIA FUTURA (+20 clientes):
  → Publicar @saas/ui, @saas/blocks como paquetes npm privados
  → pnpm update @saas/ui@latest en cada cliente
  → Automatizado, sin trabajo manual
```

---

## VARIABLES DE ENTORNO POR CLIENTE

```bash
# Cada cliente tiene su propio .env AISLADO
# No se comparte nada entre clientes

MONGODB_URI=mongodb+srv://...      # BD propia por cliente
JWT_SECRET=...                     # Secret único por cliente
CLOUDINARY_CLOUD_NAME=...          # Cloudinary propio o compartido
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MAPBOX_TOKEN=...                   # Solo si tiene delivery

NEXT_PUBLIC_API_URL=https://...    # URL del backend del cliente
NEXT_PUBLIC_TENANT_NAME=PizzaYa   # Nombre inyectado
```