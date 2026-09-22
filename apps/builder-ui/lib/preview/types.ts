import type { BuilderState } from '../../stores/builderStore'

export type ProductName = 'webOrders' | 'landingPages'
export type TemplateName = 'basic' | 'standard' | 'premium'

/** Contexto compartido por todas las secciones del preview. */
export interface PreviewContext {
  state: BuilderState
  /** URLs resueltas por clave de imagen (objectURL subido > ''). */
  images: Record<string, string>
}