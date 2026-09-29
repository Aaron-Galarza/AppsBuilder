/**
 * Paletas de marca por plantilla (identidades del generador).
 *
 * Centraliza los defaults de cada identidad:
 * - `TEMPLATE_BRAND_COLORS`: colores de marca (primary/secondary/accent).
 * - `TEMPLATE_SURFACES`: superficies neutras editables desde el wizard
 *   (background/foreground/card/muted/mutedForeground).
 * - `contrastText()` / `deriveBorder()` / `deriveRing()`: derivados
 *   (texto sobre relleno, bordes y anillo de foco), usados por el preview
 *   y por el injector con las MISMAS reglas que los `globals.css`
 *   (que resuelven borde/anillo vía `color-mix`).
 *
 * Se usa en: preview (`buildPreviewTheme`), store del builder (defaults al
 * elegir plantilla) e injector (fallback cuando el usuario no tocó nada).
 */

export type TemplateKey = 'basic' | 'standard' | 'premium'

export const TEMPLATE_ORDER: TemplateKey[] = ['basic', 'standard', 'premium']

export interface BrandColors {
  primary: string
  secondary: string
  accent: string
}

export interface SurfacesMap {
  background: string
  foreground: string
  card: string
  muted: string
  mutedForeground: string
}

/** Superficies neutras editables de cada identidad (5 hex, sin borde/anillo). */
export const TEMPLATE_SURFACES: Record<TemplateKey, SurfacesMap> = {
  // Barrio: carbón cálido
  basic: {
    background: '#131110',
    foreground: '#f4f0ea',
    card: '#1a1715',
    muted: '#201d1a',
    mutedForeground: '#a89e92',
  },
  // Moderno: dark neutro frío
  standard: {
    background: '#0c0e11',
    foreground: '#eef1f4',
    card: '#15181d',
    muted: '#1c2026',
    mutedForeground: '#9aa3ad',
  },
  // Editorial: negro cálido
  premium: {
    background: '#0a0908',
    foreground: '#f5f2eb',
    card: '#17140f',
    muted: '#1f1b14',
    mutedForeground: '#a89f92',
  },
}

/**
 * Colores de marca por defecto de cada identidad. El primary arranca igual en
 * las tres (dorado); secondary (rellenos/botones secundarios) y accent
 * (detalles: eyebrows, badges) se tonan a la identidad.
 */
export const TEMPLATE_BRAND_COLORS: Record<TemplateKey, BrandColors> = {
  basic: {
    primary: '#D4A843',
    secondary: '#A5713B',
    accent: '#E0A94F',
  },
  standard: {
    primary: '#D4A843',
    secondary: '#5B6B7C',
    accent: '#8FA3B8',
  },
  premium: {
    primary: '#D4A843',
    secondary: '#8C7343',
    accent: '#C9A962',
  },
}

/**
 * Texto legible sobre un color de relleno: negro si el color es claro,
 * blanco si es oscuro (luminancia perceptiva, umbral 150/255).
 */
export function contrastText(hex: string): string {
  const m = /^#([0-9A-Fa-f]{6})$/.exec(hex.trim())
  if (!m) return '#000000'
  const r = parseInt(m[1].slice(0, 2), 16)
  const g = parseInt(m[1].slice(2, 4), 16)
  const b = parseInt(m[1].slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#000000' : '#ffffff'
}

function hexToRgba(hex: string, alpha: number): string {
  const m = /^#([0-9A-Fa-f]{6})$/.exec(hex.trim())
  if (!m) return hex
  const r = parseInt(m[1].slice(0, 2), 16)
  const g = parseInt(m[1].slice(2, 4), 16)
  const b = parseInt(m[1].slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Borde derivado (espejo de los `globals.css`, que usan `color-mix`):
 * - basic/standard: hairline neutra sobre el foreground.
 * - premium: hairline dorada ("editorial") sobre el primary.
 */
export function deriveBorder(
  surfaces: SurfacesMap,
  brand: BrandColors,
  template: TemplateKey
): string {
  if (template === 'premium') {
    return hexToRgba(brand.primary, 0.2)
  }
  return hexToRgba(surfaces.foreground, 0.15)
}

/** Anillo de foco: sigue al primary (espejo de `--color-ring`). */
export function deriveRing(surfaces: SurfacesMap, brand: BrandColors): string {
  return hexToRgba(brand.primary, 0.45)
}