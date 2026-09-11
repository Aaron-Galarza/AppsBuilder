'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { BuilderState } from '../../stores/builderStore'
import { DEMO_IMAGES } from '../demo/demoContent'

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
 */
export function buildPreviewTheme(state: BuilderState): PreviewTheme {
  const heading = FONT_FAMILIES[state.config.fonts.heading] ?? FONT_FAMILIES.Inter
  const body = FONT_FAMILIES[state.config.fonts.body] ?? FONT_FAMILIES.Inter

  return {
    '--color-primary': state.config.colors.primary,
    '--color-secondary': state.config.colors.secondary,
    '--color-accent': state.config.colors.accent,
    '--color-background': '#0a0a0a',
    '--color-foreground': '#ffffff',
    '--color-card': '#161616',
    '--color-muted': '#1a1a1a',
    '--color-muted-foreground': '#a0a0a0',
    '--color-border': 'rgba(255, 255, 255, 0.1)',
    '--font-heading': heading,
    '--font-sans': body,
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

/** Convierte los File subidos en objectURLs (revoca los anteriores). */
export function usePreviewObjectUrls(
  imagenes: BuilderState['imagenes']
): Record<string, string> {
  const prev = useRef<Record<string, string>>({})
  return useMemo(() => {
    for (const url of Object.values(prev.current)) URL.revokeObjectURL(url)
    const next: Record<string, string> = {}
    for (const [key, file] of Object.entries(imagenes)) {
      if (file) next[key] = URL.createObjectURL(file)
    }
    prev.current = next
    return next
  }, [imagenes])
}

/**
 * Resolución de imágenes igual que generateRepo/injector:
 * archivo subido > imagen demo (si useDemoData) > vacío.
 */
export function resolvePreviewSrc(
  key: string,
  state: BuilderState,
  objectUrls: Record<string, string>
): string {
  const uploaded = objectUrls[key]
  if (uploaded) return uploaded
  if (state.useDemoData && DEMO_IMAGES[key]) return DEMO_IMAGES[key]
  return ''
}