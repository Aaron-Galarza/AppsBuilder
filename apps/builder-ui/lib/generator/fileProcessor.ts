import fs from 'fs/promises'
import path from 'path'
import type { FileEntry, GeneratorContext } from './types'

const EXCLUDE_DIRS = new Set([
  'node_modules',
  'dist',
  '.next',
  '.git',
  'coverage',
  '.turbo',
])

const EXCLUDE_FILES = new Set([
  '.DS_Store',
  'Thumbs.db',
  '.env',
  '.env.local',
  '.env.development',
])

const ALWAYS_PACKAGES = [
  'packages/ui',
  'packages/utils',
  'packages/types',
  'packages/hooks',
  'packages/configs',
]

const PRODUCT_APPS: Record<string, string[]> = {
  webOrders: ['apps/backend', 'apps/web-admin'],
  landingPages: [],
}

const MANDATORY_BLOCKS: Record<string, string[]> = {
  webOrders: ['menu', 'cart', 'checkout', 'admin'],
  landingPages: [],
}

function shouldExclude(relPath: string): boolean {
  const parts = relPath.split(/[\\/]/)

  for (const part of parts) {
    if (EXCLUDE_DIRS.has(part)) return true
  }

  const fileName = path.basename(relPath)
  if (EXCLUDE_FILES.has(fileName)) return true
  if (fileName.endsWith('.log')) return true

  return false
}

async function readDirRecursive(
  absPath: string,
  relBase: string
): Promise<FileEntry[]> {
  const entries: FileEntry[] = []

  try {
    const stat = await fs.stat(absPath)
    if (!stat.isDirectory()) return entries
  } catch {
    return entries
  }

  let items: string[]
  try {
    items = await fs.readdir(absPath)
  } catch {
    return entries
  }

  for (const item of items) {
    const itemAbs = path.join(absPath, item)
    const itemRel = relBase ? `${relBase}/${item}` : item

    if (shouldExclude(itemRel)) continue

    try {
      const stat = await fs.stat(itemAbs)

      if (stat.isDirectory()) {
        const subEntries = await readDirRecursive(itemAbs, itemRel)
        entries.push(...subEntries)
      } else if (stat.isFile()) {
        const content = await fs.readFile(itemAbs)
        entries.push({ path: itemRel, content })
      }
    } catch {
      continue
    }
  }

  return entries
}

export async function readMasterFiles(
  ctx: GeneratorContext
): Promise<FileEntry[]> {
  const masterRoot = path.resolve(process.cwd(), '../../')
  const allFiles: FileEntry[] = []

  for (const pkg of ALWAYS_PACKAGES) {
    const abs = path.join(masterRoot, pkg)
    const files = await readDirRecursive(abs, pkg)
    allFiles.push(...files)
  }

  const productApps = PRODUCT_APPS[ctx.product] || []
  for (const app of productApps) {
    const abs = path.join(masterRoot, app)
    const files = await readDirRecursive(abs, app)
    allFiles.push(...files)
  }

  const templatePath = `apps/products/${ctx.product}/templates/_${ctx.template}`
  const templateAbs = path.join(masterRoot, templatePath)
  const templateFiles = await readDirRecursive(templateAbs, templatePath)
  allFiles.push(...templateFiles)

  const blocksToRead = new Set([
    ...ctx.selectedBlocks,
    ...(MANDATORY_BLOCKS[ctx.product] || []),
  ])

  const blocksBase = path.join(masterRoot, 'packages/blocks')
  for (const block of blocksToRead) {
    const blockAbs = path.join(blocksBase, block)
    const blockFiles = await readDirRecursive(blockAbs, `packages/blocks/${block}`)
    allFiles.push(...blockFiles)
  }

  return allFiles
}
