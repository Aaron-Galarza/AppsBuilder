import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { generateRepo } from '@/lib/generator'
import { appendWizardEvent } from '@/lib/wizardEvents'

const STAGE_LABELS: Record<string, string> = {
  readMasterFiles: 'Leyendo archivos del master',
  cleanUnusedBlocks: 'Limpiando bloques no seleccionados',
  uploadAllImages: 'Subiendo imágenes a Cloudinary',
  injectConfig: 'Inyectando configuración y textos',
  createZip: 'Empaquetando ZIP',
  done: 'ZIP generado',
}

const BuilderStateSchema = z.object({
  product: z.enum(['webOrders', 'landingPages']),
  template: z.enum(['basic', 'standard', 'premium']),
  selectedBlocks: z.array(z.string()).min(1),
  config: z.object({
    name: z.string().min(2),
    slug: z.string().optional(),
    colors: z.object({
      primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
    fonts: z.object({
      heading: z.string(),
      body: z.string(),
    }),
  }),
  textos: z.record(z.record(z.string())),
  imagenes: z.record(z.string().nullable().optional()),
  configImages: z.object({
    logo: z.string().nullable().optional(),
    favicon: z.string().nullable().optional(),
  }).optional(),
})

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const data = base64.includes(',') ? base64.split(',')[1] : base64
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

function createFileFromBase64(base64: string, filename: string): File {
  const buffer = base64ToBuffer(base64)
  const mime = base64.split(';')[0].split(':')[1] || 'application/octet-stream'
  return new File([buffer], filename, { type: mime })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const parsed = BuilderStateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  try {
    const { imagenes, configImages, ...rest } = parsed.data

    const imagenesFiles: Record<string, File | null> = {}
    if (imagenes) {
      for (const [key, val] of Object.entries(imagenes)) {
        imagenesFiles[key] = val ? createFileFromBase64(val, key) : null
      }
    }

    const logoFile = configImages?.logo ? createFileFromBase64(configImages.logo, 'logo') : null
    const faviconFile = configImages?.favicon ? createFileFromBase64(configImages.favicon, 'favicon') : null

    const slug = rest.config.slug || rest.config.name.toLowerCase().replace(/\s+/g, '-')

    const state = {
      product: rest.product,
      template: rest.template,
      selectedBlocks: rest.selectedBlocks,
      config: {
        ...rest.config,
        slug,
        logo: logoFile,
        favicon: faviconFile,
      },
      textos: rest.textos,
      imagenes: imagenesFiles,
    }

    const zip = await generateRepo(state as any, (p) => {
      appendWizardEvent({
        source: 'zip',
        msg: STAGE_LABELS[p.stage] ?? p.stage,
        data: { stage: p.stage, pct: p.pct },
      })
    })

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.zip"`)
    res.send(zip)
  } catch (error) {
    console.error('Error generando repo:', error)
    appendWizardEvent({ source: 'zip', msg: 'Error generando el ZIP: ' + (error instanceof Error ? error.message : 'desconocido') })
    res.status(500).json({ error: 'Error generando el repositorio' })
  }
}
