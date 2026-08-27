import type { FileEntry } from './types'

const ALWAYS_INCLUDE: Record<string, string[]> = {
  webOrders: ['menu', 'cart', 'checkout', 'admin'],
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

function cleanPageContent(content: string, effectiveBlocks: Set<string>): string {
  const lines = content.split('\n')
  const result: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    const importMatch = trimmed.match(/^import\s+\{([^}]+)\}\s+from\s+['"]@saas\/blocks\/([^'"]+)['"]/)
    if (importMatch) {
      const block = importMatch[2]
      if (!effectiveBlocks.has(block)) continue
    }

    let dominated = false
    for (const [block, components] of Object.entries(BLOCK_COMPONENTS)) {
      if (effectiveBlocks.has(block)) continue
      if (components.some((c) => trimmed.includes(`<${c}`) || trimmed.includes(`${c}>`))) {
        dominated = true
        break
      }
    }
    if (dominated) continue

    result.push(line)
  }

  return result.join('\n')
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
