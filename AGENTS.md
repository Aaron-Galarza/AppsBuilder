# AGENTS.md — Reglas de trabajo en AppsBuilder

## REGLA CRÍTICA (siempre, sin excepción)

Para **CADA tarea**, antes de escribir una sola línea de código:

1. **Consultar SIEMPRE** `docs/ARCHITECTURE.md` (C:\Users\Aaron\Desktop\OTROS\TRABAJO\AppsBuilder\docs\ARCHITECTURE.md). Es el punto guía y la base de todo el proyecto. No seguirlo genera inconsistencias.
2. **Consultar SIEMPRE el MCP de Codebase** (`codebase-memory-mcp`) para explorar estructura, buscar símbolos y verificar relaciones antes de implementar.
3. **Proyectos de referencia:** cuando una checklist tenga desarrollo ya hecho, mirar cómo lo resolvieron:
   - `C:\Users\Aaron\Desktop\OTROS\TRABAJO\CheepersTBH` (proyecto Codebase: `C-Users-Aaron-Desktop-OTROS-TRABAJO-CheepersTBH`)
   - `C:\Users\Aaron\Desktop\OTROS\TRABAJO\TokioSushis` (proyecto Codebase: `C-Users-Aaron-Desktop-OTROS-TRABAJO-TokioSushis`)

## Objetivo

Completar el repo AppsBuilder según las checklist (backend y frontend) que el usuario va pasando, siguiendo la arquitectura definida en ARCHITECTURE.md y los patrones reales de CheepersTBH y TokioSushis.

## Filosofía (SIEMPRE)

- **Modularizar todo lo que se pueda en bloques y componentes reutilizables.** Es la idea central de AppsBuilder: si una pieza se puede reutilizar en cualquier lado, va a `packages/blocks/` (o `packages/ui/` si es atómica) con variantes por props, no a una copia por plantilla.
- **Una estética, variantes por props + lock por plantilla.** Las plantillas comparten los mismos bloques; la diferencia entre basic/standard/premium es composición de secciones y props (`variant`, `columns`, `level`). El bloqueo "bloque presente o no" ya lo provee `cleaner.ts` (`BLOCK_COMPONENTS` + `ALWAYS_INCLUDE`) y `cfg.blocks` en runtime.
- **NO duplicar chrome por plantilla.** Header, Footer, StatusBar, Login, Cart/Checkout wrappers y Admin deben vivir en bloques compartidos; un cambio se hace 1 vez en `packages/blocks`, se pushea y los clientes sincronizan.
- **Admin (avance):** `DashboardTab`, `StatsTab`, `KitchenTab` y `POSTab` ya viven en `packages/blocks/admin`; `AdminApp` con prop `level` cubre `standard` y `premium` (la página admin de cada template es un wrapper con login guard). **Pendiente:** migrar `_basic` (página inline sin tabs) a `level="basic"`.

## Contexto clave del proyecto

- Monorepo pnpm + Turborepo: `packages/` (ui, blocks, types, hooks, utils, configs) + `apps/` (backend, builder-ui, products/webOrders con templates _basic/_standard/_premium).
- Proyecto cliente objetivo: monorepo tipo `pizzaya-weborder/` con backend Express + MongoDB + JWT + Socket.io (Render) y web/admin Next.js (Vercel).
- Jerarquía de imports permitida: Plantilla → Bloques → Componentes; Bloque → Componentes/Bloques; Componente → Componentes.
