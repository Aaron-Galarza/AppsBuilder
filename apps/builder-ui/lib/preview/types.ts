import type { BuilderState } from '../../stores/builderStore'

export type ProductName = 'webOrders' | 'landingPages'
export type TemplateName = 'basic' | 'standard' | 'premium'

/** Contexto compartido por todas las secciones del preview. */
export interface PreviewContext {
  state: BuilderState
  /** URLs resueltas por clave de imagen (objectURL subido > demo > ''). */
  images: Record<string, string>
  /** Activa los datos demo (menú, estado abierto). */
  hasDemo: boolean
}