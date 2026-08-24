# AppsBuilder

Herramienta interna que genera repositorios customizados y listos para deployar en menos de una hora.

## Estructura

- `packages/` — código compartido (`@saas/ui`, `@saas/blocks`, `@saas/types`, `@saas/hooks`, `@saas/utils`, `@saas/configs`)
- `apps/builder-ui/` — la herramienta (wizard + generador de ZIP)
- `apps/backend/` — Express genérico base para los proyectos cliente
- `apps/web-admin/` — panel admin genérico base
- `apps/products/` — productos generables (`webOrders`, `landingPages`) con templates `_basic/_standard/_premium`
- `docs/` — documentación (ver `docs/ARCHITECTURE.md`)
