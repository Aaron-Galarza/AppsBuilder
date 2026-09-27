import type { BuilderState } from '../../stores/builderStore'

export type ProductName = 'webOrders' | 'landingPages'
export type TemplateName = 'basic' | 'standard' | 'premium'

/** Contexto compartido por todas las secciones del preview. */
export interface PreviewContext {
  state: BuilderState
  /** URLs resueltas por clave de imagen (objectURL subido > '').
   *  gallery es la lista multifoto; el resto son single. */
  images: {
    logo: string
    favicon: string
    hero: string
    about: string
    offer: string
    gallery: string[]
  }
}