/**
 * Configuración runtime compartida entre el ZIP generado y el preview.
 * En el ZIP: este archivo se SOBRESCRIBE por el generator (generateSiteConfig).
 * En el preview: useSiteConfig() se provee con valores del builderStore.
 */
import type { ProjectConfig } from './base.config';

export const clientConfig: ProjectConfig = {
  name: '',
  slug: '',
  colors: {
    primary: '#D4A843',
    secondary: '#8A5A2B',
    accent: '#E0A94F',
    surfaces: {
      background: '#131110',
      foreground: '#f4f0ea',
      card: '#1a1715',
      muted: '#201d1a',
      mutedForeground: '#a89e92',
    },
  },
  fonts: {
    heading: 'Poppins',
    body: 'Inter',
  },
  logo: '',
  favicon: '',
  textos: {},
  images: {
    logo: '',
    favicon: '',
    hero: '',
    about: '',
    offer: '',
    gallery: [],
  },
  blocks: [],
  whatsapp: '',
  instagram: '',
  address: '',
  mapboxToken: '',
  apiUrl: '',
};
