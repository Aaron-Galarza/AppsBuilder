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

export function cleanUnusedBlocks(
  files: FileEntry[],
  selectedBlocks: string[],
  product: string = 'webOrders'
): FileEntry[] {
  const alwaysBlocks = ALWAYS_INCLUDE[product] || []
  const effectiveBlocks = new Set([...selectedBlocks, ...alwaysBlocks])

  return files.filter((file) => {
    if (isAlwaysKept(file.path)) return true

    const block = extractBlockFromPath(file.path)
    if (block === null) return true

    return effectiveBlocks.has(block)
  })
}
