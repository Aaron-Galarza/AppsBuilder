import type { FileEntry } from './types'

interface InjectorState {
  product: 'webOrders' | 'landingPages' | null
  template: 'basic' | 'standard' | 'premium' | null
  config: {
    name: string
    slug: string
    colors: { primary: string; secondary: string; accent: string }
    fonts: { heading: string; body: string }
  }
  textos: Record<string, Record<string, string>>
}

function hexValid(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

function safeStr(val: string | undefined | null): string {
  return val ?? ''
}

function injectTailwind(content: string, state: InjectorState): string {
  let result = content
  result = result.replace(/INJECT_PRIMARY_COLOR/g, state.config.colors.primary)
  result = result.replace(/INJECT_SECONDARY_COLOR/g, state.config.colors.secondary)
  result = result.replace(/INJECT_ACCENT_COLOR/g, state.config.colors.accent)
  result = result.replace(/INJECT_FONT_HEADING/g, state.config.fonts.heading)
  result = result.replace(/INJECT_FONT_BODY/g, state.config.fonts.body)
  return result
}

function injectTextos(
  content: string,
  state: InjectorState,
  imageUrls: Record<string, string>
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

  const gallery = state.textos['gallery'] || {}
  result = result.replace(/INJECT_GALLERY_TITLE/g, safeStr(gallery['title']))

  const testimonials = state.textos['testimonials'] || {}
  result = result.replace(/INJECT_TESTIMONIALS_TITLE/g, safeStr(testimonials['title']))

  const offer = state.textos['offer'] || {}
  result = result.replace(/INJECT_OFFER_TITLE/g, safeStr(offer['title']))

  const newsletter = state.textos['newsletter'] || {}
  result = result.replace(/INJECT_NEWSLETTER_TITLE/g, safeStr(newsletter['title']))

  const features = state.textos['features'] || {}
  result = result.replace(/INJECT_FEATURES_TITLE/g, safeStr(features['title']))

  const pricing = state.textos['pricing'] || {}
  result = result.replace(/INJECT_PRICING_TITLE/g, safeStr(pricing['title']))
  result = result.replace(/INJECT_PRICING_SUBTITLE/g, safeStr(pricing['subtitle']))

  result = result.replace(/INJECT_LOGO_URL/g, imageUrls['logo'] || '')
  result = result.replace(/INJECT_FAVICON_URL/g, imageUrls['favicon'] || '')
  result = result.replace(/INJECT_HERO_IMAGE_URL/g, imageUrls['hero'] || '')
  result = result.replace(/INJECT_ABOUT_IMAGE_URL/g, imageUrls['about'] || '')

  result = result.replace(/INJECT_PRIMARY_COLOR/g, state.config.colors.primary)

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
  imageUrls: Record<string, string>
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

export function generateClientConfig(
  state: InjectorState,
  imageUrls: Record<string, string>
): FileEntry {
  const slug = state.config.slug || 'project'
  const cfg = state.config

  const content = `import type { ProjectConfig } from './base.config';

export const clientConfig: ProjectConfig = {
  name: '${cfg.name}',
  slug: '${slug}',
  colors: {
    primary: '${cfg.colors.primary}',
    secondary: '${cfg.colors.secondary}',
    accent: '${cfg.colors.accent}',
  },
  fonts: {
    heading: '${cfg.fonts.heading}',
    body: '${cfg.fonts.body}',
  },
  logo: '${imageUrls['logo'] || ''}',
  favicon: '${imageUrls['favicon'] || ''}',
};

export type { ProjectConfig } from './base.config';
`

  return {
    path: `packages/configs/${slug}.config.ts`,
    content,
  }
}

export function renameEnvFiles(files: FileEntry[]): FileEntry[] {
  return files.map((file) => {
    if (file.path.endsWith('.env.local.example')) {
      const newPath = file.path.replace('.env.local.example', '.env.local')
      return { path: newPath, content: file.content }
    }
    return file
  })
}
