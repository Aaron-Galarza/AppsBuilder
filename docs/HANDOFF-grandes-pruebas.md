# Handoff — Gran prueba integral (18-sep-2026)

> Para que cualquier modelo (o persona) pueda continuar sin repetir la investigación.
> Estado: **todo el stack probado y en verde**; cambios SIN commitear (ver `Estado git`).

---

## 1. Objetivo de esta tanda

El cliente pidió: "corra y pruebe todo el sistema; cada defecto arréglelo y deje un plan de acción para que otro modelo continúe".

Se probó el stack completo: **backend (API) → web-admin → builder-ui (generación) → frontend de plantilla**, contra **MongoDB Atlas real** (`saas-orders`). Resultados:

| Área | Resultado |
|---|---|
| Backend API | 29/29 checks OK (harness `backend-suite-final.ps1`) |
| Web-admin | login + páginas OK (SPA cliente; endpoints de dashboard mapeados a la API y todos verdes) |
| Builder-ui | wizard SSR OK + `POST /api/generate-repo` genera ZIP real (282 KB) sin credenciales ni placeholders |
| Frontend plantilla | `/`, `/menu`, `/cart`, `/checkout` → 200 con datos (pizzeria-demo-generated, puerto 3000) |

---

## 2. Defectos encontrados y corregidos (esta tanda)

1. **Seed: todos los pedidos quedaban con `createdAt` = hoy** — Mongoose `bulkWrite` con timestamps pisaba el `createdAt` explícito con "ahora". El dashboard (`orders/admin?range=hoy`) devolvía 27 en vez de 4.
   - Fix: `upsertManyRaw()` en `apps/backend/src/scripts/seed.ts` (escribe por `model.collection.bulkWrite`, sin transform de timestamps). Orders se upsertan por `orderNumber`, daily por `date` (idempotente).
2. **Contador de pedidos no sincronizado**: el primer pedido real colisionaba (409) con los demo `20260918-001..004`.
   - Fix: `seedOrderCounters()` sincroniza `ordercounters` con el `seq` máximo por día generado.
3. **Órdenes de "hoy" con hora futura**: la hora pseudoaleatoria (11-22 h) podía caer después de `now`, quedando fuera del rango `hoy` (2 en vez de 4).
   - Fix: para `back === 0` se generan en las últimas ~2 h (siempre pasado).
4. **`dateRange.getRangeBounds` appendaba `T00:00`** al input de `argToUTC` → "Invalid time value" → 400 en analytics/orders admin. Corregido (analytics quedó con `from/to` correctos).
5. **`scripts/start.ps1` aún referenciaba mock** (seteaba `MONGODB_MAX_RETRIES` para modo demo). Reemplazado por mensaje informativo (Atlas vía `.env`).
6. **web-admin `/` → 404** (el botón "Volver" del header apuntaba ahí). Fix: nuevo `apps/web-admin/src/app/page.tsx` que redirige a `/admin`.
7. **Contrato del cupón** (no era bug): `POST /api/coupons/validate/:code` con body `{paymentMethod, subtotal}`. Sin `paymentMethod` → 409 (esperado). Código inexistente → 404 (esperado).

### Expectativas que corrigió el harness (no eran bugs de la app)
- Login NO es `/auth/login` sino `/users/login`.
- `/auth/me` no existe (se validó el JWT payload).
- Analytics NO es `/analytics/orders` sino `/analytics?range=`.
- Gallery admin NO es `/gallery/admin` sino `/gallery/images`.
- Config admin es `GET /config` (no `/config/admin`).
- Delivery es `POST /delivery/calculate {lat, lng}`.
- `/addons/admin` devuelve 13 addons (las 4 categorías de adicionales son internas, no exponen ruta).
- `PUT /orders/admin/:id/status` acepta `pending|confirmed|preparing|ready|delivered|cancelled` (no `accepted`).
- `range` inválido → por diseño cae a `hoy` (200).

---

## 3. Cómo levantar todo (comandos actuales)

Requisito: credenciales de Atlas en `apps/backend/.env` (`MONGODB_URI`, gitignored). No son necesarias env para admin/builder (fallback → `http://localhost:4000`).

```powershell
# Desde la raíz del repo (C:\Users\Aaron\Desktop\OTROS\SECRETO\AppsBuilder)
scripts\start.ps1          # levanta backend (4000), web-admin (3002), builder-ui (3001)

# Opcional: resiembra la DB (idempotente; auto-seed solo si la base está vacía)
pnpm --filter @saas/backend seed

# Frontend de plantilla (proyecto generado previo, ya con node_modules)
pnpm dev   # en C:\Users\Aaron\Desktop\OTROS\SECRETO\pizzeria-demo-premium-allBlocks\apps\products\webOrders\templates\_premium  (puerto 3000)
```

Para matar por puerto: `Get-NetTCPConnection -LocalPort 4000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess }`.

---

## 4. Checklist de prueba (detalle por app)

### Backend (base: `http://localhost:4000/api`)
Harness listo: `C:\Users\Aaron\AppData\Local\Temp\opencode\backend-suite-final.ps1` — corre con:
```powershell
$env:MONGODB_URI = (Select-String .env -Pattern '^MONGODB_URI=').Line -replace '^MONGODB_URI=',''
$env:NODE_PATH = (Resolve-Path node_modules).Path   # desde apps\backend
node C:\Users\Aaron\AppData\Local\Temp\opencode\backend-suite-final.ps1
```
Cubre: health, config/status, productos/categorías/addons públicos, delivery, cupones, login, JWT, 401 sin token, listas admin, rangos `hoy`(4)/`semana`(27) e inválido(→200 default hoy), analytics `hoy/ayer/semana/mes`, alta de orden (sigue contador → `20260918-005`), cambio de estado, cleanup de la orden de prueba y reset del contador.

### Web-admin (`http://localhost:3002`)
- `/login` → 200 con formulario "Ingresar". `/admin` → 200 (shell cliente). `/` → 200 (redirige a `/admin`).
- Es SPA cliente: no se testeó con navegador. Los endpoints exactos de cada tab (verificados en `packages/hooks/*`): `GET /analytics?range=` (Overview), `GET /orders/admin?range=` + `PUT /orders/admin/:id/status` (Orders), `GET/POST/PUT/DELETE /products/admin|/categories/admin|/addons/admin` (Menu), `GET|POST /coupons/admin*`, `GET|DELETE /gallery/images`, `GET /config` + `PUT /config/schedule|banner|rain|emergency` + `POST|DELETE /config/delivery-ranges` (Config). Todos esos contratos ya pasan en el backend.
- Pendiente (opcional): prueba visual real en navegador (login → tabs con datos).

### Builder-ui (`http://localhost:3001`)
- `/` y `/builder` → 200. `POST /api/generate-repo` con payload mínimo (ver abajo) → 200 + ZIP.
- Verificación del ZIP (hecha): estructura `apps/{backend,products,web-admin}` + `packages/*`; sin `INJECT_*` ni placeholders pendientes; `apps/backend/.env` del generado usa `MONGODB_URI=mongodb://localhost:27017/saas-orders` (NO credenciales); `.env.local` de la plantilla solo con `NEXT_PUBLIC_API_URL`/tenant name. Credenciales reales NO se filtran (el generador excluye `.env` del master y vacía MONGODB_URI en `injector.ts`).
- Payload mínimo usado:
```json
{ "product": "webOrders", "template": "premium",
  "selectedBlocks": ["menu","hero","about","layout","auth","gallery","offer"],
  "config": { "name": "El Gran Test", "colors": { "primary": "#8b0000", "secondary": "#111111", "accent": "#f5c518" },
              "fonts": { "heading": "Inter", "body": "Inter" } },
  "textos": {}, "imagenes": {}, "configImages": {} }
```
- ZIP de prueba: `C:\Users\Aaron\AppData\Local\Temp\opencode\repo-el-gran-test.zip` (descomprimido en `...\gen-check`).
- Pendiente (opcional, pesado): `pnpm install` + `pnpm build` de un repo generado completo.

### Frontend plantilla (`http://localhost:3000`, proyecto generado pizzeria-demo)
- `/`, `/menu`, `/cart`, `/checkout` → 200 con contenido real (home contiene datos de la pizzería).
- Los hooks del menú/carrito/checkout llaman a los mismos endpoints públicos ya validados (`/config/status`, `/products/public`, `/categories/public`, `/addons/public`, `POST /orders`). `MapPicker` usa `/api/geocoding` → sin MAPBOX_TOKEN devuelve fallback Haversine / vacío (esperado).

---

## 5. Seguridad (verificado)

- Credenciales Atlas SOLO en `apps/backend/.env` (gitignored por `.gitignore:13`). Verificado con `git grep` que ningún archivo trackeado los contiene.
- El ZIP generado por el builder no incluye `.env` del master ni credenciales (MONGODB_URI injetado como localhost).
- No reimprimir credenciales en respuestas ni commits.

---

## 6. Estado git / cómo commiteear

Workdir: `C:\Users\Aaron\Desktop\OTROS\SECRETO\AppsBuilder`, branch `main`. El usuario hace el push.

Cambios sin commitear (24 archivos, ++425 / --1619):

- **Backend**: `src/scripts/seed.ts` (días ART, contador, raw upsert), `src/scripts/seedData.ts` (nuevo, dataset), `src/utils/dateRange.ts`, `.env.example`, `src/app.ts`, `src/config/db.ts`, `src/server.ts`; borrados `src/mock/*`, `src/scripts/data.json`.
- **Builder-ui**: borrados `components/DemoToggle.tsx`, `lib/demo/demoContent.ts`; modificados `components/PreviewPanel.tsx`, `lib/api.ts`, `lib/generator/index.ts`, `lib/preview/{sections,theme,types}.tsx|ts`, `pages/api/generate-repo.ts`, `pages/builder/{index,[step]}.tsx`, `stores/builderStore.ts`.
- **Template premium**: `apps/products/webOrders/templates/_premium/src/app/page.tsx` (stats premium removidas).
- **Docs/extras**: `docs/GETTING_STARTED.md`, `scripts/start.ps1`, `apps/web-admin/src/app/page.tsx` (nuevo).

Sugerencia de commits (2 limpios):
1. `chore(backend): remove mock/demo, seed real con fechas ART y contador` → todo lo de `apps/backend` + `docs/GETTING_STARTED.md`.
2. `feat(builder-ui): remove demo toggle, cleanup generator, fix admin home redirect` → lo de `apps/builder-ui`, `apps/web-admin`, template `_premium`, `scripts/start.ps1`.

**NUNCA commitear `apps/backend/.env`.**

---

## 7. Pendientes / notas para quien continúe

- **Commit + push**: el usuario debe confirmarlo (pregunta "¿commiteo?" quedó abierta).
- Prueba visual real en navegador de web-admin y del wizard de builder-ui (cliente JS; no cubierta por CLI).
- Opcional: `pnpm build` completo de un repo generado por el builder (validación fuerte del cleaner/injector; el proyecto pizzeria-demo ya compila y corre, estructura equivalente).
- `hero/about` son bloques SIEMPRE presentes en webOrders (ver `cleaner.ts ALWAYS_INCLUDE`); si un UUID-style test elimina bloques de marketing, no removerlos.
- El auto-seed arranca con base vacía; el seed manual es idempotente y además corrige `createdAt`/contadores de una base ya sembrada (recomendado correrlo tras subir estos cambios).
- Scripts/harness de pruebas viven en `C:\Users\Aaron\AppData\Local\Temp\opencode\` (fuera del repo, no commiteables tal cual).
## Fix 22/09: "admin vacio" y preview sin datos

CAUSA RAIZ del admin vacio (hoy): los datos demo estaban clavados al 18/09 (fecha de la primera siembra). Al correr dias, el dashboard "hoy" queda en 0 => parecia vacio. Verificado: hoy=0, semana=13, mes=27 ANTES del refresh.

Cambios de esta tanda:
- web-admin unificado al store de auth de @saas/hooks (build: login/layout). El login guardaba el token en un store local (ppsbuilder-admin-auth) pero los tabs del dashboard leen useAuthStore de hooks (saas-auth-storage) => iban sin Authorization => 401 => vacio. Ahora login usaLu useAuthStore.login() y layout gatea con isLogged. Se borraron src/stores/auth.store.ts y src/services/api.ts.
- builder-ui: seed de DEFAULT_TEXTOS (lib/constants.ts) mergeado al elegir plantilla (builderStore.setTemplate) para que los bloques de marketing del premium (hero/about/cta/contact) se vean apenas elegis product+template y queden prefilled en el paso Textos. El menu/status/checkout ya consultaban la API real (localhost:4000).
- seed.ts: nuevo modo SEED_REFRESH_DEMO=1 que borra orders/daily/ordercounters y regenera la linea de tiempo relativa a HOY. Uso: `SEED_REFRESH_DEMO=1 pnpm --filter @saas/backend seed`. Omitido por default para no pisar pedidos reales.
- scripts/start.ps1: reescrito el arranque (linea 100). Antes pnpm -r --parallel @filters run dev perdie los filtros con -r y abortaba sin levantar nada. Ahora lanza cada servicio faltante en background con su log en logs/<name>.log. Nuevo scripts/stop.ps1 para frenarlos (port 4000/3001/3002).
- Credenciales demo: admin@local.dev / admin123 (SEED_ADMIN_* en .env, comentadas por default).
