# Getting Started — levantar AppsBuilder

Guía operativa: arranque, parada, seed y uso del wizard. Arquitectura real del proyecto: `docs/ARCHITECTURE.md`.

## Prerrequisitos

- Node.js >= 20, pnpm >= 9, Git
- MongoDB (local o Atlas). El repo NO trae mock: sin DB el backend arranca pero `/health` da `db: down` y la API responde 503.

## Instalación

```bash
git clone <repo-appsbuilder>
cd AppsBuilder
pnpm install
```

## Arrancar todo (recomendado)

```bash
pnpm start        # → powershell scripts/start.ps1
```

Detecta prerequisitos, instala si falta, verifica MongoDB y levanta **solo los servicios que no estén corriendo**,
cada uno con su log en `logs/<name>.log`, y abre el navegador en el form:

| Servicio | Puerto | URL | Log |
|---|---|---|---|
| builder-ui (form + generador) | 3001 | http://localhost:3001 | `logs/form.log` |
| web-admin (panel) | 3002 | http://localhost:3002 | `logs/admin.log` |
| backend (API cliente) | 4000 | http://localhost:4000 | `logs/backend.log` |
| MongoDB | 27017 | (opcional, config en `apps/backend/.env`) | — |

Arranque manual por servicio: `cd apps/<x> && pnpm dev` (builds a sus puertos fijos). Si `pnpm start` no levanta algo,
revisá el log correspondiente.

## Detener

```bash
pnpm stop         # → scripts/stop.ps1 (mata los puertos 4000/3001/3002)
```

### Troubleshooting

```powershell
# Qué escucha en los puertos
netstat -ano | Select-String "3001|3002|4000"
# Matar procesos a mano
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
# Puerto ocupado → liberar y volver a correr
Get-NetTCPConnection -LocalPort 4000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess }
```

## Backend y MongoDB

- Configurá la URI en `apps/backend/.env` (`MONGODB_URI`, el `.env.example` es la referencia; NO commitees `.env`).
- **Auto-seed**: si la base existe pero está **vacía**, al conectar se siembra sola (productos, categorías, addons,
  cupones, horarios, galería, admin y pedidos demo).
- **Seed manual (idempotente)**: `pnpm --filter @saas/backend seed`.
- **Re-rolar los pedidos demo a HOY** (el dashboard "hoy" quedó en 0 tras pasar días):
  `SEED_REFRESH_DEMO=1 pnpm --filter @saas/backend seed` (borra orders, daily y contadores demo).
- **Credenciales demo**: `admin@local.dev` / `admin123` (o las env `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`).

## Usar el wizard (builder-ui)

Abrir `http://localhost:3001`. 7 pasos:

| Paso | Qué |
|---|---|
| 1 — Producto | `webOrders` (menú + pedidos) o `landingPages` (landing estética) |
| 2 — Plantilla | `basic` / `standard` / `premium` |
| 3 — Bloques | marcar secciones (menú bloqueado en webOrders; cart/checkout/admin/hero/about/layout/auth se incluyen siempre). El ZIP conserva los seleccionados + los `ALWAYS_INCLUDE` del cleaner |
| 4 — Config | nombre, slug kebab-case, colores (primary/secondary/accent), fuentes (heading/body) |
| 5 — Textos | editar textos de cada bloque (prefilled con defaults) |
| 6 — Imágenes | logo (512×512 PNG/SVG), favicon (32×32), hero (1920×1080), about (800×600), galería (1200×800) |
| 7 — Descargar | resumen → **Generar y Descargar** → el browser baja el `.zip` |

El preview lateral renderiza las páginas reales de la plantilla; `/menu` y `/cart` consultan la API real (4000).

## Post-descarga del ZIP

1. Descomprimir.
2. Seguir el `README.md` generado (deploy por app: web/admin/backend).
3. Completar env en cada app (**el generador vacía las credenciales a propósito**):
   - Backend: `MONGODB_URI`, `JWT_SECRET`, `PORT` (`.env`)
   - Web/Admin: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_TENANT_NAME` (`.env.local`)
4. `pnpm install && pnpm dev` local, o deployar (Vercel web/admin, Render backend).
5. Opcional `./sync-master.sh` para traer `packages/*` actualizados del master de AppsBuilder.

## Notas

- `GET /api/config/status` usa ETag: un 304 a la segunda lectura es **normal** (no es bug del polling).
- El panel admin válida la sesión contra la API; si el navegador guardó un token viejo (otra app), los 401 →
  logout + `/login` (guard en `apps/web-admin/src/app/admin/layout.tsx`).