/**
 * Ejemplo de configuración generada por AppsBuilder
 * 
 * Este archivo se genera automáticamente en el ZIP como:
 *   packages/configs/{slug}.config.ts
 * 
 * Es el ÚNICO archivo que se toca por cliente.
 * NUNCA editar packages/configs/base.config.ts o featureFlags.ts.
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
  textos: {
    hero: { title: '', subtitle: '', ctaText: '' },
    contact: { address: '', phone: '', hours: '' },
  },
  images: {
    logo: '',
    favicon: '',
    hero: '',
    about: '',
    offer: '',
    gallery: [],
  },
  blocks: ['menu', 'cart', 'checkout', 'admin', 'hero', 'about'],
  whatsapp: '',
  instagram: '',
  address: '',
  mapboxToken: '',
};

export type { ProjectConfig } from './base.config';
