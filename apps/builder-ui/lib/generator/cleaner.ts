import type { FileEntry } from './types'

const ALWAYS_INCLUDE: Record<string, string[]> = {
  // menu/cart/checkout/admin: páginas esenciales siempre presentes.
  // hero/about: importados inline en el home de los templates (nunca deben faltar,
  // si no, el page.tsx siempre-conservado rompe por import colgante).
  webOrders: ['menu', 'cart', 'checkout', 'admin', 'hero', 'about'],
  landingPages: [],
}

const ALWAYS_KEEP_PREFIXES = [
  'packages/ui/',
  'packages/utils/',
  'packages/types/',
  'packages/hooks/',
  'packages/configs/',
  'apps/backend/',
  'apps/web-admin/',
  'apps/products/',
]

function isAlwaysKept(path: string): boolean {
  return ALWAYS_KEEP_PREFIXES.some((prefix) => path.startsWith(prefix))
}

function extractBlockFromPath(path: string): string | null {
  const match = path.match(/^packages\/blocks\/([^/]+)\//)
  return match ? match[1] : null
}

const BLOCK_COMPONENTS: Record<string, string[]> = {
  hero: ['HeroSimple', 'HeroWithCarousel', 'HeroWithVideo'],
  menu: ['MenuGrid', 'CategoryFilter', 'MenuCarousel', 'MenuList', 'SearchBar', 'FeaturedBanner', 'StoreClosed', 'AddonsModal', 'ProductCard'],
  about: ['AboutSimple', 'AboutWithStory'],
  cta: ['CTASimple', 'CTAWithCountdown'],
  contact: ['ContactForm', 'ContactInfo'],
  gallery: ['GalleryGrid', 'GalleryCarousel'],
  testimonials: ['TestimonialsCarousel', 'TestimonialsGrid'],
  offer: ['OfferBanner', 'CountdownOffer'],
  newsletter: ['NewsletterForm'],
  features: ['FeaturesGrid', 'FeatureCard'],
  pricing: ['PricingTable', 'PricingCard'],
  faq: ['FAQAccordion'],
}

const JSX_NAME = /^(<\/?)([A-Z][A-Za-z0-9_.]*)/

function buildDominatedSet(effectiveBlocks: Set<string>): Set<string> {
  const dominated = new Set<string>()
  for (const [block, components] of Object.entries(BLOCK_COMPONENTS)) {
    if (effectiveBlocks.has(block)) continue
    components.forEach((c) => dominated.add(c))
  }
  return dominated
}

/**
 * Elimina imports de bloques no seleccionados y borra por completo los elementos
 * JSX (multilínea o no) de componentes dominados por bloques no seleccionados.
 *
 * Antes solo se descartaba la línea que contenía `<Component`, dejando las props
 * y el cierre `/>` de elementos multilínea, rompiendo el build. Ahora se elimina
 * el elemento completo haciendo balance de tags, incluyendo anidados.
 */
function cleanPageContent(content: string, effectiveBlocks: Set<string>): string {
  const dominated = buildDominatedSet(effectiveBlocks)

  const withImportsCleaned = stripUnselectedImports(content, effectiveBlocks)

  return removeDominatedElements(withImportsCleaned, dominated)
}

/**
 * Elimina por completo las sentencias `import ... from '@saas/blocks/<block>'`
 * cuando <block> no está seleccionado, sin importar si el import ocupa una sola
 * línea o varias (import con conjunto de nombres multilínea).
 */
function stripUnselectedImports(content: string, effectiveBlocks: Set<string>): string {
  const lines = content.split('\n')
  const out: string[] = []
  let buf: string[] = []

  const statementDone = (text: string): boolean => /;?\s*$/.test(text) && /from\s+['"][^'"]+['"]\s*;?\s*$/.test(text)

  const flush = () => {
    if (!buf.length) return
    const stmt = buf.join('\n')
    const m = stmt.match(/from\s+['"]@saas\/blocks\/([^'"]+)['"]/)
    if (!m || effectiveBlocks.has(m[1])) out.push(...buf)
    buf = []
  }

  for (const line of lines) {
    const t = line.trim()
    if (/^import\s/.test(t)) {
      if (buf.length) flush()
      buf.push(line)
      if (statementDone(t)) flush()
    } else if (buf.length) {
      buf.push(line)
      if (statementDone(t)) flush()
    } else {
      out.push(line)
    }
  }
  flush()

  return out.join('\n')
}

function removeDominatedElements(text: string, dominated: Set<string>): string {
  const out: string[] = []
  let i = 0
  const n = text.length

  while (i < n) {
    const lt = text.indexOf('<', i)
    if (lt === -1) {
      out.push(text.slice(i))
      break
    }
    out.push(text.slice(i, lt))

    const m = text.slice(lt).match(JSX_NAME)
    if (!m) {
      out.push('<')
      i = lt + 1
      continue
    }

    const closing = m[1] === '</'
    const tag = m[2]
    const base = tag.split('.').pop()!

    if (closing || !dominated.has(base)) {
      // tag no dominado (o cierre): lo mantenemos tal cual y seguimos
      out.push(text.slice(lt, lt + m[0].length))
      i = lt + m[0].length
      continue
    }

    // Elemento abierto y dominado: hay que consumirlo completo hasta su cierre.
    const nextGt = text.indexOf('>', lt + m[0].length)
    if (nextGt !== -1 && text.slice(lt, nextGt + 1).trim().endsWith('/>')) {
      // Self-closing: descartamos solo este tag
      i = nextGt + 1
      continue
    }

    const consumed = consumeElement(text, lt)
    if (consumed === -1) {
      // No se pudo balancear: por seguridad drenamos el resto.
      out.push(text.slice(lt))
      break
    }
    i = consumed
  }

  return out.join('')
}

/** Devuelve el índice justo después del cierre del elemento cuyo tag abre en `start`, o -1 si no balancea. */
function consumeElement(text: string, start: number): number {
  const open = text.slice(start).match(JSX_NAME)
  if (!open || open[1] === '</') return -1

  let depth = 1
  let i = start + open[0].length
  const n = text.length

  while (i < n) {
    const lt = text.indexOf('<', i)
    if (lt === -1) return -1

    const m = text.slice(lt).match(JSX_NAME)
    if (!m) {
      i = lt + 1
      continue
    }

    if (m[1] === '</') {
      depth -= 1
      const afterClose = lt + m[0].length
      if (depth === 0) return afterClose
      i = afterClose
      continue
    }

    // Tag abierto o self-closing
    const nextGt = text.indexOf('>', lt)
    if (nextGt === -1) return -1
    const tagBody = text.slice(lt, nextGt + 1)
    if (!tagBody.trim().endsWith('/>')) {
      depth += 1
    }
    i = nextGt + 1
  }

  return -1
}

export function cleanUnusedBlocks(
  files: FileEntry[],
  selectedBlocks: string[],
  product: string = 'webOrders'
): FileEntry[] {
  const alwaysBlocks = ALWAYS_INCLUDE[product] || []
  const effectiveBlocks = new Set([...selectedBlocks, ...alwaysBlocks])

  return files
    .filter((file) => {
      if (isAlwaysKept(file.path)) return true

      const block = extractBlockFromPath(file.path)
      if (block === null) return true

      return effectiveBlocks.has(block)
    })
    .map((file) => {
      const isPageTsx = file.path.endsWith('/page.tsx') && file.path.includes('/app/')
      if (!isPageTsx) return file

      const content = Buffer.isBuffer(file.content)
        ? file.content.toString('utf-8')
        : file.content

      return { path: file.path, content: cleanPageContent(content, effectiveBlocks) }
    })
}
