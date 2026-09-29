import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import type { EnvSource, EnvSetup, FileEntry } from './types'
import {
  TEMPLATE_SURFACES,
  contrastText,
  type SurfacesMap,
  type TemplateKey,
} from '../preview/templateThemes'

interface InjectorState {
  product: 'webOrders' | 'landingPages' | null
  template: 'basic' | 'standard' | 'premium' | null
  config: {
    name: string
    slug: string
    colors: {
      primary: string
      secondary: string
      accent: string
      surfaces: SurfacesMap | null
    }
    fonts: { heading: string; body: string }
  }
  textos: Record<string, Record<string, string>>
  selectedBlocks: string[]
}

/** Superficies efectivas: las editadas por el usuario o los defaults de la identidad. */
function surfacesFor(state: InjectorState): SurfacesMap {
  return (
    state.config.colors.surfaces ??
    TEMPLATE_SURFACES[(state.template as TemplateKey | null) ?? 'basic']
  )
}

function hexValid(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

function safeStr(val: string | undefined | null): string {
  return val ?? ''
}

/** Convierte un valor de imagen compartido (string o lista) a texto plano. */
function strOr(val: string | string[] | undefined): string {
  return typeof val === 'string' ? val : ''
}

type ImageUrls = Record<string, string | string[]>

function injectTailwind(content: string, state: InjectorState): string {
  let result = injectColors(content, state)
  result = result.replace(/INJECT_FONT_HEADING/g, state.config.fonts.heading)
  result = result.replace(/INJECT_FONT_BODY/g, state.config.fonts.body)
  return result
}

/** Reemplaza los tokens de color y superficies en un texto (tailwind.config o globals.css). */
function injectColors(content: string, state: InjectorState): string {
  let result = content
  result = result.replace(/INJECT_PRIMARY_COLOR/g, state.config.colors.primary)
  result = result.replace(/INJECT_SECONDARY_COLOR/g, state.config.colors.secondary)
  result = result.replace(/INJECT_ACCENT_COLOR/g, state.config.colors.accent)
  result = result.replace(/INJECT_ON_PRIMARY_COLOR/g, contrastText(state.config.colors.primary))
  result = result.replace(/INJECT_ON_SECONDARY_COLOR/g, contrastText(state.config.colors.secondary))
  result = result.replace(/INJECT_ON_ACCENT_COLOR/g, contrastText(state.config.colors.accent))
  const s = surfacesFor(state)
  result = result.replace(/INJECT_SURFACE_BACKGROUND/g, s.background)
  result = result.replace(/INJECT_SURFACE_FOREGROUND/g, s.foreground)
  result = result.replace(/INJECT_SURFACE_CARD/g, s.card)
  result = result.replace(/INJECT_SURFACE_MUTED/g, s.muted)
  result = result.replace(/INJECT_SURFACE_MUTED_FOREGROUND/g, s.mutedForeground)
  return result
}

function injectTextos(
  content: string,
  state: InjectorState,
  imageUrls: ImageUrls
): string {
  let result = content

  result = result.replace(/INJECT_PROJECT_NAME/g, state.config.name)

  const hero = state.textos['hero'] || {}
  result = result.replace(/INJECT_HERO_TITLE/g, safeStr(hero['title']))
  result = result.replace(/INJECT_HERO_SUBTITLE/g, safeStr(hero['subtitle']))
  result = result.replace(/INJECT_HERO_CTA_TEXT/g, safeStr(hero['ctaText']))

  const about = state.textos['about'] || {}
  result = result.replace(/INJECT_ABOUT_TITLE/g, safeStr(about['title']))
  result = result.replace(/INJECT_ABOUT_TEXT/g, safeStr(about['text']))
  result = result.replace(/INJECT_ABOUT_DESCRIPTION/g, safeStr(about['text']))

  result = result.replace(/INJECT_TENANT_DESCRIPTION/g, safeStr(about['text']) || safeStr(hero['subtitle']))

  const cta = state.textos['cta'] || {}
  result = result.replace(/INJECT_CTA_TITLE/g, safeStr(cta['title']))
  result = result.replace(/INJECT_CTA_SUBTITLE/g, safeStr(cta['subtitle']))
  result = result.replace(/INJECT_CTA_BUTTON_TEXT/g, safeStr(cta['buttonText']))

  const menu = state.textos['menu'] || {}
  result = result.replace(/INJECT_MENU_TITLE/g, safeStr(menu['title']))
  result = result.replace(/INJECT_MENU_DESCRIPTION/g, safeStr(menu['description']))

  const contact = state.textos['contact'] || {}
  result = result.replace(/INJECT_CONTACT_TITLE/g, safeStr(contact['title']))
  result = result.replace(/INJECT_CONTACT_ADDRESS/g, safeStr(contact['address']))
  result = result.replace(/INJECT_CONTACT_PHONE/g, safeStr(contact['phone']))
  result = result.replace(/INJECT_CONTACT_HOURS/g, safeStr(contact['hours']))
  result = result.replace(/INJECT_WHATSAPP_NUMBER/g, safeStr(contact['phone']).replace(/\D/g, ''))

  const gallery = state.textos['gallery'] || {}
  result = result.replace(/INJECT_GALLERY_TITLE/g, safeStr(gallery['title']))

  const testimonials = state.textos['testimonials'] || {}
  result = result.replace(/INJECT_TESTIMONIALS_TITLE/g, safeStr(testimonials['title']))
  result = result.replace(/INJECT_TESTIMONIALS_SUBTITLE/g, safeStr(testimonials['subtitle']))

  const offer = state.textos['offer'] || {}
  result = result.replace(/INJECT_OFFER_TITLE/g, safeStr(offer['title']))
  result = result.replace(/INJECT_OFFER_SUBTITLE/g, safeStr(offer['subtitle']))
  result = result.replace(/INJECT_OFFER_BANNER_TITLE/g, safeStr(offer['bannerTitle']))
  result = result.replace(/INJECT_OFFER_BANNER_DESCRIPTION/g, safeStr(offer['bannerDescription']))
  result = result.replace(/INJECT_OFFER_DISCOUNT_TEXT/g, safeStr(offer['discountText']))
  result = result.replace(/INJECT_OFFER_BUTTON_TEXT/g, safeStr(offer['buttonText']))
  result = result.replace(/INJECT_OFFER_BACKGROUND_IMAGE/g, strOr(imageUrls['offer']))

  const newsletter = state.textos['newsletter'] || {}
  result = result.replace(/INJECT_NEWSLETTER_TITLE/g, safeStr(newsletter['title']))
  result = result.replace(/INJECT_NEWSLETTER_SUBTITLE/g, safeStr(newsletter['subtitle']))
  result = result.replace(/INJECT_NEWSLETTER_PLACEHOLDER/g, safeStr(newsletter['placeholder']))
  result = result.replace(/INJECT_NEWSLETTER_BUTTON_TEXT/g, safeStr(newsletter['buttonText']))

  const features = state.textos['features'] || {}
  result = result.replace(/INJECT_FEATURES_TITLE/g, safeStr(features['title']))

  const pricing = state.textos['pricing'] || {}
  result = result.replace(/INJECT_PRICING_TITLE/g, safeStr(pricing['title']))
  result = result.replace(/INJECT_PRICING_SUBTITLE/g, safeStr(pricing['subtitle']))

  result = result.replace(/INJECT_TENANT_NAME/g, state.config.name)
  result = result.replace(/INJECT_MENU_SUBTITLE/g, safeStr(menu['description']))

  result = result.replace(/INJECT_LOGO_URL/g, strOr(imageUrls['logo']))
  result = result.replace(/INJECT_FAVICON_URL/g, strOr(imageUrls['favicon']))
  result = result.replace(/INJECT_HERO_IMAGE_URL/g, strOr(imageUrls['hero']))
  result = result.replace(/INJECT_ABOUT_IMAGE_URL/g, strOr(imageUrls['about']))

  // Colores/superficies (redundante con 'tailwind' por si el globals.css
  // se procesa por esta vía, que es la real en Tailwind v4).
  result = injectColors(result, state)

  return result
}

function getPackageName(filePath: string, state: InjectorState): string {
  const slug = state.config.slug || 'project'

  if (filePath.startsWith('apps/backend/')) {
    return slug + '-backend'
  }
  if (filePath.startsWith('apps/web-admin/')) {
    return slug + '-admin'
  }
  if (filePath.startsWith('apps/products/')) {
    return slug + '-web'
  }
  return slug
}

function injectPackageJson(
  content: string,
  state: InjectorState,
  filePath: string
): string {
  const pkgName = getPackageName(filePath, state)
  return content.replace(/INJECT_PROJECT_NAME/g, pkgName)
}

function injectEnv(
  content: string,
  state: InjectorState
): string {
  let result = content
  result = result.replace(/INJECT_API_URL/g, '')
  result = result.replace(/INJECT_TENANT_NAME/g, state.config.name)
  result = result.replace(/INJECT_MAPBOX_TOKEN/g, '')
  // Modo de estado del local según plantilla: basic = solo botón, resto = horarios
  result = result.replace(/INJECT_STATUS_MODE/g, state.template === 'basic' ? 'manual' : 'schedule')
  return result
}

function isTextFile(filePath: string): boolean {
  const textExtensions = [
    '.tsx', '.ts', '.jsx', '.js', '.css', '.json',
    '.mjs', '.cjs', '.yaml', '.yml', '.md', '.env',
    '.example', '.config',
  ]
  return textExtensions.some((ext) => filePath.endsWith(ext))
}

function getInjectionType(filePath: string): 'tailwind' | 'textos' | 'packageJson' | 'env' | 'none' {
  if (filePath.endsWith('tailwind.config.ts')) return 'tailwind'
  if (filePath.endsWith('package.json')) return 'packageJson'
  if (filePath.includes('.env')) return 'env'
  if (
    filePath.includes('/app/') ||
    filePath.includes('/components/') ||
    filePath.includes('/sections/') ||
    filePath.endsWith('globals.css')
  ) {
    return 'textos'
  }
  return 'none'
}

export function injectConfig(
  files: FileEntry[],
  state: InjectorState,
  imageUrls: ImageUrls
): FileEntry[] {
  return files.map((file) => {
    if (!isTextFile(file.path)) return file

    const content = Buffer.isBuffer(file.content)
      ? file.content.toString('utf-8')
      : file.content

    const injType = getInjectionType(file.path)

    let newContent: string

    switch (injType) {
      case 'tailwind':
        newContent = injectTailwind(content, state)
        break
      case 'textos':
        newContent = injectTextos(content, state, imageUrls)
        break
      case 'packageJson':
        newContent = injectPackageJson(content, state, file.path)
        break
      case 'env':
        newContent = injectEnv(content, state)
        break
      default:
        newContent = content
    }

    return { path: file.path, content: newContent }
  })
}

/**
 * Genera el archivo site.config.ts con la configuración completa del proyecto
 * (incluye textos, images, blocks) — usado por @saas/configs/site en el ZIP.
 */
export function generateSiteConfig(
  state: InjectorState,
  imageUrls: ImageUrls,
): FileEntry {
  const slug = state.config.slug || 'project'
  const cfg = state.config
  const textosStr = JSON.stringify(state.textos, null, 2)
  // Solo los bloques que el usuario seleccionó: las plantillas condicionan
  // qué secciones renderizar con cfg.blocks.includes(...).
  const blocksStr = JSON.stringify([...state.selectedBlocks])
  const gallery = Array.isArray(imageUrls['gallery']) ? imageUrls['gallery'] : []

  const content = `import type { ProjectConfig } from './base.config';

export const clientConfig: ProjectConfig = {
  name: ${JSON.stringify(cfg.name)},
  slug: ${JSON.stringify(slug)},
  colors: {
    primary: ${JSON.stringify(cfg.colors.primary)},
    secondary: ${JSON.stringify(cfg.colors.secondary)},
    accent: ${JSON.stringify(cfg.colors.accent)},
    surfaces: ${JSON.stringify(surfacesFor(state))},
  },
  fonts: {
    heading: ${JSON.stringify(cfg.fonts.heading)},
    body: ${JSON.stringify(cfg.fonts.body)},
  },
  logo: ${JSON.stringify(imageUrls['logo'] || '')},
  favicon: ${JSON.stringify(imageUrls['favicon'] || '')},
  textos: ${textosStr},
  images: {
    logo: ${JSON.stringify(imageUrls['logo'] || '')},
    favicon: ${JSON.stringify(imageUrls['favicon'] || '')},
    hero: ${JSON.stringify(imageUrls['hero'] || '')},
    about: ${JSON.stringify(imageUrls['about'] || '')},
    offer: ${JSON.stringify(imageUrls['offer'] || '')},
    gallery: ${JSON.stringify(gallery)},
  },
  blocks: ${blocksStr},
  whatsapp: '',
  instagram: '',
  address: '',
  mapboxToken: '',
  apiUrl: '',
};

export type { ProjectConfig } from './base.config';
`

  return {
    path: `packages/configs/site.config.ts`,
    content,
  }
}

/**
 * Variables que se copian al .env del ZIP cuando el usuario elige
 * "importar .env de prueba" o pega su propio bloque clave:valor.
 */
const EXPORTABLE_ENV_KEYS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'STORE_LAT',
  'STORE_LNG',
  'MAPBOX_TOKEN',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'GEOCODING_BUDGET_MONTHLY',
  'SEED_ADMIN_EMAIL',
  'SEED_ADMIN_PASSWORD',
] as const

/** CORS del proyecto exportado: storefront en 3000 y admin en 3002. */
const EXPORTED_CLIENT_URL = 'http://localhost:3000,http://localhost:3002'

/** Parser mínimo de .env: solo KEY=VALUE; ignora comentarios, vacíos y comillas. */
function parseDotEnv(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const key = t.slice(0, eq).trim()
    let val = t.slice(eq + 1).trim()
    if (val.length > 1 && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
      val = val.slice(1, -1)
    }
    if (key) out[key] = val
  }
  return out
}

/**
 * Lee el .env del backend del master: es exactamente el que usa el preview
 * del wizard, así que el ZIP arranca contra la misma base de datos.
 */
async function readPreviewEnv(): Promise<Record<string, string>> {
  try {
    const masterRoot = path.resolve(process.cwd(), '../..')
    const raw = await fs.readFile(path.join(masterRoot, 'apps/backend/.env'), 'utf-8')
    return parseDotEnv(raw)
  } catch {
    return {}
  }
}

/** Secret JWT aleatorio por export: nunca se reparte el mismo entre clientes. */
function randomJwtSecret(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Escribe una clave solo en su línea real de configuración.
 * Usar String.replace con un string es inseguro acá: la primera aparición de
 * MONGODB_URI= está en el bloque de comentarios del ejemplo, no en la config.
 */
function setEnvValue(content: string, key: string, value: string): string {
  // Ojo: el flag 'm' va en el constructor, `(?m)` no existe en JS.
  const line = new RegExp(`^${key}=.*$`, 'm')
  return line.test(content)
    ? content.replace(line, `${key}=${value}`)
    : `${content.trimEnd()}\n${key}=${value}\n`
}

export async function renameEnvFiles(
  files: FileEntry[],
  env?: EnvSetup
): Promise<FileEntry[]> {
  const source: EnvSource = env?.source ?? 'template'
  const provided = source === 'preview'
    ? await readPreviewEnv()
    : source === 'custom'
      ? env?.values ?? {}
      : {}

  return files.map((file) => {
    if (file.path.endsWith('.env.local.example')) {
      const newPath = file.path.replace('.env.local.example', '.env.local')
      let envContent = String(file.content)
      // Inyectar API_URL por defecto para desarrollo
      if (envContent.includes('NEXT_PUBLIC_API_URL=')) {
        envContent = envContent.replace('NEXT_PUBLIC_API_URL=', 'NEXT_PUBLIC_API_URL=http://localhost:4000')
      }
      return { path: newPath, content: envContent }
    }
    if (file.path.endsWith('apps/backend/.env.example')) {
      let envContent = String(file.content)

      for (const key of EXPORTABLE_ENV_KEYS) {
        const value = provided[key]
        if (value) envContent = setEnvValue(envContent, key, value)
      }

      // En el master 3001 es el builder; en el ZIP ese puerto es el admin.
      envContent = setEnvValue(envContent, 'CLIENT_URL', EXPORTED_CLIENT_URL)

      if (!provided.JWT_SECRET) {
        envContent = setEnvValue(envContent, 'JWT_SECRET', randomJwtSecret())
      }
      if (!provided.MONGODB_URI) {
        envContent = setEnvValue(envContent, 'MONGODB_URI', '')
      }

      return { path: 'apps/backend/.env', content: envContent }
    }
    return file
  })
}
