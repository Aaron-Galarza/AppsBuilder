'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { BuilderState } from '../../stores/builderStore'
import {
  TEMPLATE_SURFACES,
  contrastText,
  deriveBorder,
  deriveRing,
  type SurfacesMap,
  type TemplateKey,
} from './templateThemes'

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
  const template = (state.template as TemplateKey | null) ?? 'basic'
  // Superficies del usuario si eligió plantilla; si no, las de la identidad.
  const surfaces: SurfacesMap =
    state.config.colors.surfaces ?? TEMPLATE_SURFACES[template] ?? TEMPLATE_SURFACES.basic
  const brand = state.config.colors

  return {
    '--color-primary': brand.primary,
    '--color-secondary': brand.secondary,
    '--color-accent': brand.accent,
    '--color-on-primary': contrastText(brand.primary),
    '--color-on-secondary': contrastText(brand.secondary),
    '--color-on-accent': contrastText(brand.accent),
    '--color-background': surfaces.background,
    '--color-foreground': surfaces.foreground,
    '--color-card': surfaces.card,
    '--color-muted': surfaces.muted,
    '--color-muted-foreground': surfaces.mutedForeground,
    '--color-border': deriveBorder(surfaces, brand, template),
    '--color-ring': deriveRing(surfaces, brand),
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