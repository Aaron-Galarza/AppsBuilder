/**
 * Configuración visual del proyecto cliente, inyectada por AppsBuilder
 * al generar el ZIP. Se materializa en packages/configs/{slug}.config.ts
 * y es el ÚNICO lugar centralizado de customización.
 */
export interface ProjectConfig {
  name: string;
  slug: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo: string;
  favicon: string;
  /** Textos por bloque (bloque -> pares de clave/valor editados en el builder). */
  textos: Record<string, Record<string, string>>;
  /** URLs de imágenes del proyecto. */
  images: {
    logo: string;
    favicon: string;
    hero: string;
    about: string;
    offer: string;
  };
  /** Bloques seleccionados (incluye los obligatorios del producto). */
  blocks: string[];
  whatsapp?: string;
  instagram?: string;
  address?: string;
  /** Solo si el proyecto tiene delivery */
  mapboxToken?: string;
  apiUrl?: string;
}
