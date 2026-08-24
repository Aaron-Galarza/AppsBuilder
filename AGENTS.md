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

## Contexto clave del proyecto

- Monorepo pnpm + Turborepo: `packages/` (ui, blocks, types, hooks, utils, configs) + `apps/` (backend, builder-ui, products/webOrders con templates _basic/_standard/_premium).
- Proyecto cliente objetivo: monorepo tipo `pizzaya-weborder/` con backend Express + MongoDB + JWT + Socket.io (Render) y web/admin Next.js (Vercel).
- Jerarquía de imports permitida: Plantilla → Bloques → Componentes; Bloque → Componentes/Bloques; Componente → Componentes.
