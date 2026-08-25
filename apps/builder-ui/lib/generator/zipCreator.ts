import type { FileEntry } from './types'

interface ZipState {
  product: 'webOrders' | 'landingPages'
  template: 'basic' | 'standard' | 'premium'
  selectedBlocks: string[]
  config: {
    name: string
    slug: string
  }
}

const MANDATORY_BLOCKS: Record<string, string[]> = {
  webOrders: ['menu', 'cart', 'checkout', 'admin'],
  landingPages: [],
}

function generateSyncScript(selectedBlocks: string[], product: string): string {
  const mandatory = MANDATORY_BLOCKS[product] || []
  const allBlocks = [...new Set([...selectedBlocks, ...mandatory])]

  const blockLines = allBlocks
    .map((b) => `git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/blocks/${b}/`)
    .join('\n')

  return `#!/bin/bash
# sync-master.sh — generado por AppsBuilder al crear el ZIP
# NO modificar manualmente

MASTER_REMOTE="appsbuilder"
MASTER_URL="https://github.com/tuuser/appsbuilder.git"
MASTER_BRANCH="main"

# Agregar remote si no existe todavía
if ! git remote get-url $MASTER_REMOTE > /dev/null 2>&1; then
  git remote add $MASTER_REMOTE $MASTER_URL
fi

# Fetchear contenido del master
git fetch $MASTER_REMOTE

# Base siempre completa
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/ui/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/utils/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/types/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/hooks/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/configs/

# Bloques seleccionados para este cliente
${blockLines}

git add packages/
git commit -m "sync: update packages from appsbuilder master"
git push origin main
`
}

function generateReadme(state: ZipState): string {
  const { product, template, config } = state
  const deployWeb = `cd apps/products/${product}/templates/${template}\nvercel deploy --prod`

  const deployAdmin = product === 'webOrders'
    ? `\n\n### Admin (solo webOrders)\ncd apps/web-admin\nvercel deploy --prod`
    : ''

  const deployBackend = product === 'webOrders'
    ? `\n\n### Backend (solo webOrders)\ncd apps/backend\nrender deploy --prod`
    : ''

  return `# ${config.name}

Generado con AppsBuilder

## Deploy${deployBackend}${deployAdmin}

### Web
${deployWeb}

## Variables de entorno
Completar .env.local antes de deployar (ver .env.local de cada app)

## Sync con master
chmod +x sync-master.sh
./sync-master.sh
`
}

export async function createZip(
  files: FileEntry[],
  state: ZipState
): Promise<Buffer> {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  for (const file of files) {
    zip.file(file.path, file.content)
  }

  const syncScript = generateSyncScript(state.selectedBlocks, state.product)
  zip.file('sync-master.sh', syncScript)

  const readme = generateReadme(state)
  zip.file('README.md', readme)

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  return buffer
}
