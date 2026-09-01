import type { FileEntry, GeneratorContext, GeneratorConfig } from './types'
import { readMasterFiles } from './fileProcessor'
import { cleanUnusedBlocks } from './cleaner'
import { injectConfig, generateClientConfig, renameEnvFiles } from './injector'
import { createZip } from './zipCreator'
import { uploadAllImages } from '@/lib/cloudinary'
import { DEMO_IMAGES } from '@/lib/demo/demoContent'
import simulateDB from '@/lib/demo/simulateDB.json'
import type { BuilderState } from '@/stores/builderStore'

export type { FileEntry, GeneratorContext, GeneratorConfig }

export async function generateRepo(state: BuilderState): Promise<Buffer> {
  const ctx: GeneratorContext = {
    product: state.product!,
    template: state.template!,
    selectedBlocks: state.selectedBlocks,
  }

  const files = await readMasterFiles(ctx)
  const cleanedFiles = cleanUnusedBlocks(files, state.selectedBlocks, state.product!)

  const useDemoData = state.useDemoData === true

  let demoFiles = cleanedFiles
  if (useDemoData && state.product === 'webOrders') {
    let wroteDemoData = false
    demoFiles = cleanedFiles.map((file) => {
      if (file.path !== 'apps/backend/src/scripts/data.json') return file
      wroteDemoData = true
      return { ...file, content: Buffer.from(JSON.stringify(simulateDB, null, 2), 'utf-8') }
    })

    if (!wroteDemoData) {
      demoFiles.push({
        path: 'apps/backend/src/scripts/data.json',
        content: Buffer.from(JSON.stringify(simulateDB, null, 2), 'utf-8'),
      })
    }
  }

  const imageUrls = await uploadAllImages(state)
  if (useDemoData) {
    for (const [key, url] of Object.entries(DEMO_IMAGES)) {
      if (!imageUrls[key]) imageUrls[key] = url
    }
  }

  const injectorState = {
    product: state.product,
    template: state.template,
    config: state.config,
    textos: state.textos,
  }

  const injectedFiles = injectConfig(demoFiles, injectorState, imageUrls)
  const renamedFiles = renameEnvFiles(injectedFiles)

  const clientConfig = generateClientConfig(injectorState, imageUrls)
  renamedFiles.push(clientConfig)

  const zip = await createZip(renamedFiles, {
    product: state.product!,
    template: state.template!,
    selectedBlocks: state.selectedBlocks,
    config: state.config,
  })

  return zip
}
