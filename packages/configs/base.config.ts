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
  whatsapp?: string;
  instagram?: string;
  address?: string;
  /** Solo si el proyecto tiene delivery */
  mapboxToken?: string;
}
