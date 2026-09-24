import type { FileEntry, GeneratorContext, GeneratorConfig } from './types'
import { readMasterFiles } from './fileProcessor'
import { cleanUnusedBlocks } from './cleaner'
import { injectConfig, generateSiteConfig, renameEnvFiles } from './injector'
import { createZip } from './zipCreator'
import { uploadAllImages } from '@/lib/cloudinary'
import type { BuilderState } from '@/stores/builderStore'

export type { FileEntry, GeneratorContext, GeneratorConfig }

export interface GenerateProgress {
  stage: string
  pct: number
}

export async function generateRepo(
  state: BuilderState,
  onProgress?: (p: GenerateProgress) => void
): Promise<Buffer> {
  const ctx: GeneratorContext = {
    product: state.product!,
    template: state.template!,
    selectedBlocks: state.selectedBlocks,
  }

  const bump = (stage: string, pct: number) => onProgress?.({ stage, pct })

  bump('readMasterFiles', 5)
  const files = await readMasterFiles(ctx)

  bump('cleanUnusedBlocks', 20)
  const cleanedFiles = cleanUnusedBlocks(files, state.selectedBlocks, state.product!)

  bump('uploadAllImages', 40)
  const imageUrls = await uploadAllImages(state)

  bump('injectConfig', 60)
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

  bump('createZip', 80)
  const zip = await createZip(renamedFiles, {
    product: state.product!,
    template: state.template!,
    selectedBlocks: state.selectedBlocks,
    config: state.config,
  })

  bump('done', 100)

  return zip
}
