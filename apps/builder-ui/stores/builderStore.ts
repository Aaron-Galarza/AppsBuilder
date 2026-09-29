import { create } from 'zustand'
import { DEFAULT_TEXTOS, PRODUCT_BLOCKS, MANDATORY_BLOCKS } from '../lib/constants'
import {
  TEMPLATE_BRAND_COLORS,
  TEMPLATE_SURFACES,
  type SurfacesMap,
  type TemplateKey,
} from '../lib/preview/templateThemes'

export interface BuilderState {
  product: 'webOrders' | 'landingPages' | null
  template: 'basic' | 'standard' | 'premium' | null
  selectedBlocks: string[]
  config: {
    name: string
    slug: string
    colors: {
      primary: string
      secondary: string
      accent: string
      /** Superficies neutras editables; null = usar defaults de la identidad. */
      surfaces: SurfacesMap | null
    }
    fonts: { heading: string; body: string }
    logo: File | null
    favicon: File | null
  }
  textos: Record<string, Record<string, string>>
  /** Imágenes por bloque; 'gallery' admite varias (File[]). */
  imagenes: Record<string, File | File[] | null>

  setProduct: (p: BuilderState['product']) => void
  setTemplate: (t: BuilderState['template']) => void
  setSelectedBlocks: (b: string[]) => void
  setConfig: (c: Partial<BuilderState['config']>) => void
  setTextos: (t: BuilderState['textos']) => void
  setImagenes: (i: BuilderState['imagenes']) => void
  reset: () => void
}

const initialState = {
  product: null as BuilderState['product'],
  template: null as BuilderState['template'],
  selectedBlocks: [] as string[],
  config: {
    name: '',
    slug: '',
    colors: {
      primary: '#D4A843',
      secondary: '#8A5A2B',
      accent: '#E0A94F',
      surfaces: null as SurfacesMap | null,
    },
    fonts: { heading: 'Poppins', body: 'Inter' },
    logo: null as File | null,
    favicon: null as File | null,
  },
  textos: {} as Record<string, Record<string, string>>,
  imagenes: {} as Record<string, File | File[] | null>,
}

export const useBuilderStore = create<BuilderState>((set) => ({
  ...initialState,

  setProduct: (product) => set({ product, template: null, selectedBlocks: [] }),

  setTemplate: (template) =>
    set((state) => {
      const textos = { ...DEFAULT_TEXTOS }
      for (const [block, fields] of Object.entries(state.textos)) {
        textos[block] = { ...(textos[block] || {}), ...fields }
      }
      // Al elegir plantilla, pre-seleccionamos todos los bloques disponibles de la misma
      // (los obligatorios como 'menu' quedan bloqueados en la UI; el resto es deseleccionable).
      const product = state.product
      let available: string[] = []
      let mandatory: string[] = []
      let colors = state.config.colors
      if (product && template) {
        available = [...(PRODUCT_BLOCKS[product]?.[template] ?? [])]
        mandatory = [...(MANDATORY_BLOCKS[product] ?? [])]
        // Cada identidad trae sus colores de marca y superficies por defecto:
        // al cambiar de plantilla se resetean a los defaults de la nueva.
        const key = template as TemplateKey
        colors = {
          ...TEMPLATE_BRAND_COLORS[key],
          surfaces: { ...TEMPLATE_SURFACES[key] },
        }
      }
      return {
        template,
        selectedBlocks: [...new Set([...mandatory, ...available])],
        textos,
        config: { ...state.config, colors },
      }
    }),

  setSelectedBlocks: (selectedBlocks) => set({ selectedBlocks }),

  setConfig: (config) => set((state) => ({
    config: { ...state.config, ...config },
  })),

  setTextos: (textos) => set({ textos }),

  setImagenes: (imagenes) => set({ imagenes }),

  reset: () => set(initialState),
}))