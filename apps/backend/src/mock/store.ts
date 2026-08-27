/**
 * ============================================================================
 * MOCK STORE - Simulación de base de datos para desarrollo sin MongoDB
 * ============================================================================
 *
 * Este módulo carga data.json y lo sirve como si fuera una base de datos real.
 * Cuando MongoDB NO está disponible, todas las rutas públicas y admin
 * responden usando estos datos en memoria.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CÓMO FUNCIONA:
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. Al iniciar el servidor, se intenta conectar a MongoDB.
 * 2. Si la conexión FALLA (timeout, URI inválida, etc.):
 *    - Se carga data.json como fallback
 *    - Se crean "modelos mock" con los mismos métodos que Mongoose
 *    - Todas las rutas responden con datos del mock
 * 3. Si la conexión ÉXITO:
 *    - El mock NO se usa
 *    - Todo funciona con MongoDB real
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CÓMO REVERTIR (VOLVER A MONGODB REAL):
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Opción 1 (Recomendada):
 *   1. Crear cuenta en MongoDB Atlas: https://cloud.mongodb.com
 *   2. Crear cluster gratuito (M0)
 *   3. Crear usuario de base de datos
 *   4. Copiar connection string
 *   5. Pegar en apps/backend/.env:
 *      MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/appsbuilder
 *   6. Ejecutar seed:
 *      pnpm --filter @saas/backend seed
 *   7. Reiniciar el servidor
 *
 * Opción 2 (Local):
 *   1. Instalar MongoDB Community: https://www.mongodb.com/try/download/community
 *   2. Ejecutar mongod en puerto 27017
 *   3. En apps/backend/.env:
 *      MONGODB_URI=mongodb://localhost:27017/appsbuilder
 *   4. Ejecutar seed:
 *      pnpm --filter @saas/backend seed
 *   5. Reiniciar el servidor
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CÓMO FUNCIONA EL MOCK:
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - Los datos se cargan de apps/backend/src/scripts/data.json
 * - Cada colección (users, products, categories, etc.) se guarda en un Map
 * - Los IDs son strings simples (no ObjectId de MongoDB)
 * - Las operaciones CRUD simuladas mantienen la misma interfaz que Mongoose
 * - Los datos persisten SOLO en memoria (se pierden al reiniciar)
 * - Las contraseñas en data.json son hash de ejemplo (no funcionan para login)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LIMITACIONES DEL MOCK:
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - No persiste entre reinicios del servidor
 * - No soporta agregaciones complejas de MongoDB
 * - No tiene transacciones
 * - Socket.io no emite eventos reales (el mock no los procesa)
 * - Las imágenes subidas no se guardan (Cloudinary no está configurado)
 * - No hay rate limiting real (es en memoria, pero eso sí funciona)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHIVOS RELACIONADOS:
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - data.json: Datos de ejemplo completos
 * - mock/routes.ts: Manejadores de rutas que usan el mock
 * - mock/store.ts: Este archivo (el store en memoria)
 * - config/db.ts: Decide si usar mock o MongoDB real
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Tipos simplificados para el mock
type MockDoc = Record<string, unknown> & { _id: string };

interface MockCollection {
  find(filter?: Record<string, unknown>): MockDoc[];
  findById(id: string): MockDoc | undefined;
  create(doc: Omit<MockDoc, '_id'>): MockDoc;
  findOneAndUpdate(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options?: { new?: boolean; upsert?: boolean }
  ): MockDoc | undefined;
  deleteOne(id: string): boolean;
  countDocuments(filter?: Record<string, unknown>): number;
}

class InMemoryCollection implements MockCollection {
  private data: MockDoc[] = [];

  constructor(initialData: MockDoc[] = []) {
    this.data = [...initialData];
  }

  find(filter: Record<string, unknown> = {}): MockDoc[] {
    if (Object.keys(filter).length === 0) return [...this.data];
    return this.data.filter((doc) => {
      return Object.entries(filter).every(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Soporte para operadores como $gte, $lte
          const obj = value as Record<string, unknown>;
          const docVal = doc[key];
          return Object.entries(obj).every(([op, opVal]) => {
            if (op === '$gte') return (docVal as number) >= (opVal as number);
            if (op === '$lte') return (docVal as number) <= (opVal as number);
            if (op === '$in') return (opVal as unknown[]).includes(docVal);
            return true;
          });
        }
        return doc[key] === value;
      });
    });
  }

  findById(id: string): MockDoc | undefined {
    return this.data.find((doc) => doc._id === id);
  }

  create(doc: Omit<MockDoc, '_id'>): MockDoc {
    const newDoc = {
      ...doc,
      _id: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.push(newDoc);
    return newDoc;
  }

  findOneAndUpdate(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options?: { new?: boolean; upsert?: boolean }
  ): MockDoc | undefined {
    const idx = this.data.findIndex((doc) =>
      Object.entries(filter).every(([k, v]) => doc[k] === v)
    );

    if (idx >= 0) {
      // Merge update
      const $set = (update as { $set?: Record<string, unknown> }).$set ?? update;
      this.data[idx] = { ...this.data[idx], ...$set, updatedAt: new Date().toISOString() };
      return options?.new ? this.data[idx] : undefined;
    }

    if (options?.upsert) {
      const $setOnInsert = (update as { $setOnInsert?: Record<string, unknown> }).$setOnInsert ?? {};
      return this.create({ ...filter, ...$setOnInsert } as Omit<MockDoc, '_id'>);
    }

    return undefined;
  }

  deleteOne(id: string): boolean {
    const idx = this.data.findIndex((doc) => doc._id === id);
    if (idx >= 0) {
      this.data.splice(idx, 1);
      return true;
    }
    return false;
  }

  countDocuments(filter: Record<string, unknown> = {}): number {
    return this.find(filter).length;
  }

  // Método adicional para el mock
  push(doc: MockDoc): void {
    this.data.push(doc);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CARGA DE DATOS
// ═══════════════════════════════════════════════════════════════════════════

function loadData(): Record<string, InMemoryCollection> {
  try {
    const dataPath = join(__dirname, '..', 'scripts', 'data.json');
    const raw = readFileSync(dataPath, 'utf-8');
    const parsed = JSON.parse(raw);

    const collections: Record<string, InMemoryCollection> = {};

    // Cada clave del JSON se convierte en una colección
    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) {
        collections[key] = new InMemoryCollection(value as MockDoc[]);
      } else if (typeof value === 'object' && value !== null) {
        collections[key] = new InMemoryCollection([value as MockDoc]);
      }
    }

    console.log('[mock-store] Datos cargados desde data.json');
    for (const [name, col] of Object.entries(collections)) {
      console.log(`  - ${name}: ${col.countDocuments()} documentos`);
    }

    return collections;
  } catch (err) {
    console.error('[mock-store] Error cargando data.json:', err);
    return {};
  }
}

// Singleton
let collections: Record<string, InMemoryCollection> | null = null;

export function getMockCollections(): Record<string, InMemoryCollection> {
  if (!collections) {
    collections = loadData();
  }
  return collections;
}

export function getCollection(name: string): InMemoryCollection {
  const cols = getMockCollections();
  if (!cols[name]) {
    cols[name] = new InMemoryCollection();
  }
  return cols[name];
}

/** Verifica si el mock está activo (se activa cuando MongoDB no está disponible) */
let mockActive = false;

export function isMockActive(): boolean {
  return mockActive;
}

export function activateMock(): void {
  mockActive = true;
  console.log('[mock-store] Mock store activado - usando datos de data.json');
}

export function deactivateMock(): void {
  mockActive = false;
}

export { InMemoryCollection, MockDoc };
