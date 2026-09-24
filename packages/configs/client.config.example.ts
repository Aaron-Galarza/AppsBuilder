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
  },
  blocks: ['menu', 'cart', 'checkout', 'admin', 'hero', 'about'],
  whatsapp: '',
  instagram: '',
  address: '',
  mapboxToken: '',
};

export type { ProjectConfig } from './base.config';
