import { create } from 'zustand'

export interface BuilderState {
  product: 'webOrders' | 'landingPages' | null
  template: 'basic' | 'standard' | 'premium' | null
  selectedBlocks: string[]
  config: {
    name: string
    slug: string
    colors: { primary: string; secondary: string; accent: string }
    fonts: { heading: string; body: string }
    logo: File | null
    favicon: File | null
  }
  textos: Record<string, Record<string, string>>
  imagenes: Record<string, File | null>

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
    colors: { primary: '#D4A843', secondary: '#1A1A1A', accent: '#4CAF50' },
    fonts: { heading: 'Poppins', body: 'Inter' },
    logo: null as File | null,
    favicon: null as File | null,
  },
  textos: {} as Record<string, Record<string, string>>,
  imagenes: {} as Record<string, File | null>,
}

export const useBuilderStore = create<BuilderState>((set) => ({
  ...initialState,

  setProduct: (product) => set({ product, template: null, selectedBlocks: [] }),

  setTemplate: (template) => set({ template, selectedBlocks: [] }),

  setSelectedBlocks: (selectedBlocks) => set({ selectedBlocks }),

  setConfig: (config) => set((state) => ({
    config: { ...state.config, ...config },
  })),

  setTextos: (textos) => set({ textos }),

  setImagenes: (imagenes) => set({ imagenes }),

  reset: () => set(initialState),
}))
