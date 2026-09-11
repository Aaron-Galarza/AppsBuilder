import type { Addon, Category, Product } from '@saas/types'
import simulateDB from '../demo/simulateDB.json'

export interface DemoMenu {
  products: Product[]
  categories: Category[]
  isOpen: boolean
}

interface RawDb {
  categories: Category[]
  addons: Addon[]
  products: Product[]
  schedules?: { emergencyClosed?: boolean }[]
}

/** Fusiona los adicionales disponibles dentro de cada producto su categoría. */
function mergeAddonsIntoProducts(products: Product[], addons: Addon[]): Product[] {
  return products.map((product) => ({
    ...product,
    addons: addons.filter(
      (addon) =>
        addon.available &&
        addon.categories.some((cat) => cat._id === product.category || cat.name === product.category)
    ),
  }))
}

let cached: DemoMenu | null = null

/** Menú del modo demo, derivado de simulateDB.json. */
export function getDemoMenu(): DemoMenu {
  if (cached) return cached

  const db = (simulateDB as unknown) as RawDb
  const products = mergeAddonsIntoProducts(db.products ?? [], db.addons ?? [])
  const isOpen = !(db.schedules?.[0]?.emergencyClosed ?? false)

  cached = { products, categories: db.categories ?? [], isOpen }
  return cached
}