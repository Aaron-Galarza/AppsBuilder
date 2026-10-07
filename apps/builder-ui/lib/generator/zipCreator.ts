import type { EnvSource, FileEntry } from './types'

interface ZipState {
  product: 'webOrders' | 'landingPages'
  template: 'basic' | 'standard' | 'premium'
  selectedBlocks: string[]
  config: {
    name: string
    slug: string
  }
  envSource?: EnvSource
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
  const { product, template, config, envSource = 'template' } = state
  const deployWeb = `cd apps/products/${product}/templates/${template}\nvercel deploy --prod`

  const deployAdmin = product === 'webOrders'
    ? `\n\n### Admin (solo webOrders)\ncd apps/web-admin\nvercel deploy --prod`
    : ''

  const deployBackend = product === 'webOrders'
    ? `\n\n### Backend (solo webOrders)\ncd apps/backend\nrender deploy --prod`
    : ''

  const dbSection: Record<EnvSource, string> = {
    preview:
      'El `.env` del backend ya quedó apuntando a la base de datos de prueba, la misma que usa el preview. No hay que tocar nada para levantarlo.',
    custom:
      'El `.env` del backend ya quedó con las variables que pegaste al generar el proyecto.',
    template:
      '> **Falta configurar la base de datos.** Completá `MONGODB_URI` en `apps/backend/.env`.\n>\n> Sin base de datos el backend igual levanta, pero todas las APIs devuelven `503 Servicio sin base de datos disponible` y el menú no carga.\n>\n> Andá a https://www.mongodb.com/atlas, creá un cluster gratis, en *Database Access* creá un usuario y en *Network Access* agregá tu IP (o `0.0.0.0/0` para probar). Después copiá la connection string:\n>\n> ```\n> MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority\n> ```',
  }

  return `# ${config.name}

Generado con AppsBuilder — plantilla \`${template}\`

## Correr en local

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

| Servicio | URL |
| --- | --- |
| Backend | http://localhost:4000 |
| Web | http://localhost:3000 |
${product === 'webOrders' ? '| Admin | http://localhost:3002 |\n' : ''}
El backend siembra solo datos demo si la base está vacía.
Para volver a generarlos: \`SEED_REFRESH_DEMO=1 pnpm --filter @saas/backend seed\`

## Base de datos

${dbSection[envSource]}

## Deploy${deployBackend}${deployAdmin}

### Web
${deployWeb}

## Variables de entorno
El \`.env\` del backend ya viene escrito. Para deploy, cargá las mismas
variables en el panel del proveedor (Render / Vercel) y completá
\`NEXT_PUBLIC_API_URL\` en el \`.env.local\` de cada frontend con la URL pública del backend.

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

  const rootPkg = {
    name: state.config.slug || 'project',
    private: true,
    scripts: {
      dev: 'pnpm --filter "./apps/**" dev',
      build: 'pnpm --filter "./apps/**" build',
    },
  }
  zip.file('package.json', JSON.stringify(rootPkg, null, 2))

  const workspaceYaml = `packages:
  - 'packages/*'
  - 'apps/*'
  - 'apps/products/*'
  - 'apps/products/*/templates/*'

# pnpm >= 10.1: permite los build scripts de estas dependencias
# (si falta, pnpm bloquea sus postinstall con ERR_PNPM_IGNORED_BUILDS).
onlyBuiltDependencies:
  - '@parcel/watcher'
  - esbuild
  - unrs-resolver

# pnpm >= 10.26 y v11: reemplaza a onlyBuiltDependencies.
allowBuilds:
  '@parcel/watcher': true
  esbuild: true
  unrs-resolver: true
`
  zip.file('pnpm-workspace.yaml', workspaceYaml)

  // tsconfig.base.json: apps/backend/tsconfig.json lo extiende con
  // "../../tsconfig.base.json". Sin este archivo en la raíz del proyecto el
  // typecheck del backend generado falla con TS5083 y se pierden esModuleInterop,
  // target y downlevelIteration.
  const tsconfigBase = JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
      },
    },
    null,
    2
  )
  zip.file('tsconfig.base.json', tsconfigBase)

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
