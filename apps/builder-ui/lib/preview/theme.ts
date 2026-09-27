'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { BuilderState } from '../../stores/builderStore'

export type PreviewTheme = Record<string, string> & CSSProperties

export const FONT_FAMILIES: Record<string, string> = {
  Inter: "'Inter', sans-serif",
  Poppins: "'Poppins', sans-serif",
  'Playfair Display': "'Playfair Display', serif",
  Montserrat: "'Montserrat', sans-serif",
}

const FONT_LINKS: Record<string, string> = {
  Inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  Poppins: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
  'Playfair Display':
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&display=swap',
  Montserrat: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap',
}

/**
 * Superficies de cada identidad de plantilla (espejo de los tokens
 * `--color-background/card/muted/...` de cada `globals.css`). El primary,
 * secondary, accent y fuentes vienen del usuario en el wizard.
 */
const TEMPLATE_SURFACES: Record<
  'basic' | 'standard' | 'premium',
  {
    background: string
    foreground: string
    card: string
    muted: string
    mutedForeground: string
    border: string
  }
> = {
  // Barrio: carbón cálido
  basic: {
    background: '#131110',
    foreground: '#f4f0ea',
    card: '#1a1715',
    muted: '#201d1a',
    mutedForeground: '#a89e92',
    border: 'rgba(244, 240, 234, 0.1)',
  },
  // Moderno: dark neutro frío
  standard: {
    background: '#0c0e11',
    foreground: '#eef1f4',
    card: '#15181d',
    muted: '#1c2026',
    mutedForeground: '#9aa3ad',
    border: 'rgba(238, 241, 244, 0.1)',
  },
  // Editorial: negro cálido + hairline dorada
  premium: {
    background: '#0a0908',
    foreground: '#f5f2eb',
    card: '#17140f',
    muted: '#1f1b14',
    mutedForeground: '#a89f92',
    border: 'rgba(233, 214, 168, 0.16)',
  },
}

/**
 * Tema del site generado, espejo de lo que inyecta el injector en
 * `globals.css` de cada plantilla. Se aplica como CSS vars en un wrapper.
 *
 * Se incluyen los `--radius-*` default de Tailwind v4 (que el ZIP genera al
 * no redefinirlos): el builder redefine esos tokens a 3px/4px en su propio
 * `@theme`, y sin estos el site preview heredaría los radios del builder.
 */
export function buildPreviewTheme(state: BuilderState): PreviewTheme {
  const heading = FONT_FAMILIES[state.config.fonts.heading] ?? FONT_FAMILIES.Inter
  const body = FONT_FAMILIES[state.config.fonts.body] ?? FONT_FAMILIES.Inter
  const surface =
    TEMPLATE_SURFACES[(state.template as 'basic' | 'standard' | 'premium') ?? 'basic'] ??
    TEMPLATE_SURFACES.basic

  return {
    '--color-primary': state.config.colors.primary,
    '--color-secondary': state.config.colors.secondary,
    '--color-accent': state.config.colors.accent,
    '--color-background': surface.background,
    '--color-foreground': surface.foreground,
    '--color-card': surface.card,
    '--color-muted': surface.muted,
    '--color-muted-foreground': surface.mutedForeground,
    '--color-border': surface.border,
    '--font-heading': heading,
    '--font-sans': body,
    '--radius-xs': '.25rem',
    '--radius-sm': '.375rem',
    '--radius-md': '.625rem',
    '--radius-lg': '.875rem',
    '--radius-xl': '1.125rem',
    '--radius-2xl': '1.25rem',
    '--radius-3xl': '1.5rem',
    '--radius-full': 'calc(infinity * 1px)',
    fontFamily: body,
    background: 'var(--color-background)',
    color: 'var(--color-foreground)',
  }
}

/** Carga las fuentes elegidas (Google Fonts) dentro de la página del builder. */
export function usePreviewFonts(state: BuilderState) {
  const fonts = useMemo(() => {
    const names = new Set([state.config.fonts.heading, state.config.fonts.body])
    return [...names].map((name) => FONT_LINKS[name]).filter((href): href is string => Boolean(href))
  }, [state.config.fonts.heading, state.config.fonts.body])

  useEffect(() => {
    const links = fonts.map((href) => {
      const el = document.createElement('link')
      el.rel = 'stylesheet'
      el.href = href
      document.head.appendChild(el)
      return el
    })
    return () => links.forEach((el) => el.remove())
  }, [fonts])
}

/**
 * Convierte los File subidos (imagenes de bloques + logo/favicon del config)
 * en objectURLs (revoca los anteriores).
 * - `single`: claves de una sola imagen (logo, favicon, hero, about, offer).
 * - `gallery`: lista de objectURLs de la galería multifoto.
 */
export function usePreviewObjectUrls(
  imagenes: BuilderState['imagenes'],
  configFile?: { logo: File | null; favicon: File | null }
): { single: Record<string, string>; gallery: string[] } {
  const prev = useRef<{ single: Record<string, string>; gallery: string[] }>({
    single: {},
    gallery: [],
  })
  return useMemo(() => {
    for (const url of [...Object.values(prev.current.single), ...prev.current.gallery]) {
      URL.revokeObjectURL(url)
    }
    const single: Record<string, string> = {}
    const gallery: string[] = []
    const sources: Record<string, File | File[] | null> = {
      ...imagenes,
      logo: configFile?.logo ?? null,
      favicon: configFile?.favicon ?? null,
    }
    for (const [key, file] of Object.entries(sources)) {
      if (!file) continue
      if (Array.isArray(file)) {
        gallery.push(...file.map((f) => URL.createObjectURL(f)))
      } else {
        single[key] = URL.createObjectURL(file)
      }
    }
    prev.current = { single, gallery }
    return { single, gallery }
  }, [imagenes, configFile?.logo, configFile?.favicon])
}

/**
 * Resolución de imágenes igual que generateRepo/injector:
 * archivo subido > vacío.
 */
export function resolvePreviewSrc(
  key: string,
  state: BuilderState,
  single: Record<string, string>
): string {
  return single[key] || ''
}