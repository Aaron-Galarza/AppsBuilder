import type { BuilderState } from '@/stores/builderStore'

async function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function filesToBase64(
  imagenes: Record<string, File | File[] | null>
): Promise<Record<string, string | string[] | null>> {
  const result: Record<string, string | string[] | null> = {}

  for (const [key, file] of Object.entries(imagenes)) {
    if (!file) {
      result[key] = null
      continue
    }

    if (Array.isArray(file)) {
      result[key] = await Promise.all(file.map((f) => fileToBase64(f)))
    } else {
      result[key] = await fileToBase64(file)
    }
  }

  return result
}

export async function generateRepo(
  state: BuilderState,
  onProgress?: (pct: number) => void,
  envSetup?: { source: 'template' | 'preview' | 'custom'; values?: Record<string, string> }
): Promise<Blob> {
  onProgress?.(0)

  const base64Imagenes = await filesToBase64(state.imagenes)

  onProgress?.(30)

  const base64Config = {
    logo: state.config.logo ? await fileToBase64(state.config.logo) : null,
    favicon: state.config.favicon ? await fileToBase64(state.config.favicon) : null,
  }

  const payload = {
    product: state.product,
    template: state.template,
    selectedBlocks: state.selectedBlocks,
    config: {
      name: state.config.name,
      slug: state.config.slug,
      colors: state.config.colors,
      fonts: state.config.fonts,
    },
    textos: state.textos,
    imagenes: base64Imagenes,
    configImages: base64Config,
    envSetup,
  }

  onProgress?.(60)

  const res = await fetch('/api/generate-repo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'Error al generar el proyecto')
  }

  onProgress?.(90)

  const blob = await res.blob()

  onProgress?.(100)

  return blob
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
