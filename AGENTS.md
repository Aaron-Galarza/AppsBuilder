# AGENTS.md — Reglas de trabajo en AppsBuilder

## REGLA CRÍTICA (siempre, sin excepción)

Para **CADA tarea**, antes de escribir una sola línea de código:

1. **Consultar SIEMPRE** `docs/ARCHITECTURE.md` (`C:\Users\Aaron\Desktop\OTROS\SECRETO\AppsBuilder\docs\ARCHITECTURE.md`).
   Es la referencia única del sistema (modelo de generación, pipeline, bloques, rutas del backend, seed). No seguirlo
   genera inconsistencias. Complemento operativo: `docs/GETTING_STARTED.md`.
2. **Consultar SIEMPRE el MCP de Codebase** (`codebase-memory-mcp`) para explorar estructura, buscar símbolos y
   verificar relaciones antes de implementar.
3. **Proyectos de referencia:** cuando una checklist tenga desarrollo ya hecho, mirar cómo lo resolvieron:
   - `C:\Users\Aaron\Desktop\OTROS\TRABAJO\CheepersTBH`
   - `C:\Users\Aaron\Desktop\OTROS\TRABAJO\TokioSushis`
   (solo como referencia de patrones; el código de AppsBuilder manda.)

## Objetivo

Completar el repo AppsBuilder según las checklist (backend y frontend) que el usuario va pasando, siguiendo la
arquitectura definida en ARCHITECTURE.md y los patrones reales de CheepersTBH y TokioSushis.

## Filosofía (SIEMPRE)

- **Modularizar todo lo que se pueda en bloques y componentes reutilizables.** Es la idea central de AppsBuilder:
  si una pieza se puede reutilizar, va a `packages/blocks/` (o `packages/ui/` si es atómica) con variantes por props,
  no a una copia por plantilla.
- **Una estética, variantes por props + lock por plantilla.** Las plantillas comparten los mismos bloques; la
  diferencia entre basic/standard/premium es composición de secciones y props (`variant`, `columns`, `level`).
  El bloqueo "bloque presente o no" ya lo provee `cleaner.ts` (`BLOCK_COMPONENTS` + `ALWAYS_INCLUDE`) y
  `cfg.blocks` en runtime.
- **NO duplicar chrome por plantilla.** Header, Footer, StatusBar, PromoBanner, Login, Cart/Checkout wrappers y
  Admin viven en bloques compartidos; un cambio se hace 1 vez en `packages/blocks`.
- **Admin (unificado):** `AdminApp` con prop `level` cubre las 3 plantillas (`basic` → `BasicSections` sin tabs;
  `standard`/`premium` → shells con tabs: Overview, Orders, Menu, Coupons, Gallery, Config). Las páginas admin de
  cada template son wrappers con login guard.

## Contexto clave del proyecto

- Monorepo pnpm + Turborepo: `packages/` (ui, blocks, types, hooks, utils, configs) + `apps/` (backend 4000,
  builder-ui 3001, web-admin 3002) + `apps/products/{webOrders,landingPages}/templates/{_basic,_standard,_premium}`.
- Generador: `apps/builder-ui/lib/generator/` (fileProcessor → cleaner → injector → renameEnvFiles → zipCreator).
  El ZIP sale con `packages/configs/site.config.ts` y envs sin credenciales.
- Estado/auth: `web-admin` y los templates usan `useAuthStore` de `@saas/hooks` (persist `saas-auth-storage`);
  el guard de sesión vive en `apps/web-admin/src/app/admin/layout.tsx`.
- Backend **sin mock**: MongoDB real, auto-seed si la base está vacía; `SEED_REFRESH_DEMO=1` re-rola los pedidos
  demo; credenciales demo `admin@local.dev` / `admin123`.
- Jerarquía de imports permitida: Plantilla → Bloques → Componentes; Bloque → Componentes/Bloques; Componente → Componentes.
- Servicios con `scripts/start.ps1` / `stop.ps1` (logs en `logs/`). No reinventar eso.

## Operativa

- Comentarios del código en **español** y siempre actualizados (no documentar lo que ya no existe).
- **Nunca commitear** `apps/backend/.env`, credenciales ni llaves. Verificar con `git status`/`git diff` antes.
- Conventional Commits; el push y la creación de branches los hace el usuario (preguntar antes de commitear si no fue pedido).