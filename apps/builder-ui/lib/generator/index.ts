import type { FileEntry, GeneratorContext, GeneratorConfig } from './types'
import { readMasterFiles } from './fileProcessor'
import { cleanUnusedBlocks } from './cleaner'
import { injectConfig, generateClientConfig, renameEnvFiles } from './injector'

export type { FileEntry, GeneratorContext, GeneratorConfig }

interface GeneratorState {
  product: 'webOrders' | 'landingPages'
  template: 'basic' | 'standard' | 'premium'
  selectedBlocks: string[]
  config: GeneratorConfig
  textos: Record<string, Record<string, string>>
}

export async function generateRepo(state: GeneratorState): Promise<FileEntry[]> {
  const ctx: GeneratorContext = {
    product: state.product,
    template: state.template,
    selectedBlocks: state.selectedBlocks,
  }

  const files = await readMasterFiles(ctx)
  const cleanedFiles = cleanUnusedBlocks(files, state.selectedBlocks, state.product)

  const imageUrls: Record<string, string> = {}

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

  return renamedFiles
}
