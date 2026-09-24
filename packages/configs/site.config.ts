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
    primary: '#0D9488',
    secondary: '#111827',
    accent: '#F59E0B',
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
  },
  blocks: [],
  whatsapp: '',
  instagram: '',
  address: '',
  mapboxToken: '',
  apiUrl: '',
};
