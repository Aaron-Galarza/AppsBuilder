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
  logo: 'https://res.cloudinary.com/xxx/image/upload/logos/pizzaya-logo.png',
  favicon: 'https://res.cloudinary.com/xxx/image/upload/logos/pizzaya-favicon.ico',
  whatsapp: '5491155551234',
  instagram: 'pizzaya_oficial',
  address: 'Av. Corrientes 1234, CABA',
  mapboxToken: 'pk.eyJ1xxxx',
};

export type { ProjectConfig } from './base.config';
