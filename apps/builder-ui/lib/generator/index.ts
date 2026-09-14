import type { FileEntry, GeneratorContext, GeneratorConfig } from './types'
import { readMasterFiles } from './fileProcessor'
import { cleanUnusedBlocks } from './cleaner'
import { injectConfig, generateSiteConfig, renameEnvFiles } from './injector'
import { createZip } from './zipCreator'
import { uploadAllImages } from '@/lib/cloudinary'
import { DEMO_IMAGES } from '@/lib/demo/demoContent'
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
    selectedBlocks: state.selectedBlocks,
  }

  const injectedFiles = injectConfig(cleanedFiles, injectorState, imageUrls)
  const renamedFiles = renameEnvFiles(injectedFiles)

  const siteConfig = generateSiteConfig(injectorState, imageUrls)
  renamedFiles.push(siteConfig)

  const zip = await createZip(renamedFiles, {
    product: state.product!,
    template: state.template!,
    selectedBlocks: state.selectedBlocks,
    config: state.config,
  })

  return zip
}
