import type { FileEntry, GeneratorContext, GeneratorConfig } from './types'
import { readMasterFiles } from './fileProcessor'
import { cleanUnusedBlocks } from './cleaner'
import { injectConfig, generateClientConfig, renameEnvFiles } from './injector'
import { createZip } from './zipCreator'
import { uploadAllImages } from '@/lib/cloudinary'
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

  const imageUrls = await uploadAllImages(state)

  const injectorState = {
    product: state.product,
    template: state.template,
    config: state.config,
    textos: state.textos,
  }

  const injectedFiles = injectConfig(cleanedFiles, injectorState, imageUrls)
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
