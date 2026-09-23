# AppsBuilder

Herramienta interna que genera **repositorios cliente customizados y listos para deployar** en menos de una hora:
elegís producto, plantilla y bloques en un wizard, y bajás un `.zip` con un monorepo completo
(frontend + admin + backend según el producto).

## Estructura

- `packages/` — código compartido (`@saas/ui`, `@saas/blocks`, `@saas/hooks`, `@saas/types`, `@saas/utils`, `@saas/configs`)
- `apps/builder-ui/` — la herramienta: wizard de 7 pasos + generador de ZIP (puerto 3001)
- `apps/backend/` — backend Express base para los proyectos cliente (puerto 4000)
- `apps/web-admin/` — panel admin genérico base (puerto 3002)
- `apps/products/` — productos generables (`webOrders`, `landingPages`) con templates `_basic/_standard/_premium`
- `scripts/` — `start.ps1` / `stop.ps1` (levantar/matar servicios con logs en `logs/`)
- `docs/` — `ARCHITECTURE.md` (referencia del sistema) y `GETTING_STARTED.md` (arranque + wizard + seed)

## Arranque rápido

```bash
pnpm install
pnpm start        # levanta builder-ui (3001), web-admin (3002) y backend (4000)
```

Backend necesita MongoDB: sin ella arranca en `db: down`; con base vacía se auto-siembra
(credenciales demo: `admin@local.dev` / `admin123`).

```
docs/ARCHITECTURE.md      → cómo está hecho el sistema (generador, backend, packages)
docs/GETTING_STARTED.md   → cómo levantarlo, usarlo y troubleshootearlo
AGENTS.md                 → reglas de trabajo para agentes de código
```

Git: Conventional Commits. Los `.env` y credenciales jamás se commitean.