/**
 * Configuración runtime compartida entre el ZIP generado y el preview.
 * En el ZIP: este archivo se SOBRESCRIBE por el generator (generateSiteConfig).
 * En el preview: useSiteConfig() se provee con valores del builderStore.
 */
import type { ProjectConfig } from './base.config';

export const clientConfig: ProjectConfig = {
  name: 'Pizzaya',
  slug: 'pizzaya',
  colors: {
    primary: '#D4A843',
    secondary: '#1A1A1A',
    accent: '#4CAF50',
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
