'use client'

import type { BuilderState } from '../stores/builderStore'
import { useBuilderStore } from '../stores/builderStore'

/**
 * Sincronización del estado del wizard hacia una ventana separada de preview
 * (`window.open('/builder/preview')`) usando localStorage + BroadcastChannel.
 *
 * - La ventana del wizard serializa el estado (Files -> dataURL) en cada cambio
 *   y lo publica por BroadcastChannel, guardando el último snapshot en localStorage
 *   para que una ventana recién abierta pueda hidratarse antes del primer mensaje.
 * - La ventana de preview escucha el canal y aplica el estado al store local.
 */

export interface FileSnapshot {
  name: string
  type: string
  dataUrl: string
}

export interface PreviewSnapshot {
  product: BuilderState['product']
  template: BuilderState['template']
  selectedBlocks: string[]
  config: {
    name: string
    slug: string
    colors: BuilderState['config']['colors']
    fonts: BuilderState['config']['fonts']
    logo: FileSnapshot | null
    favicon: FileSnapshot | null
  }
  textos: BuilderState['textos']
  imagenes: Record<string, FileSnapshot | FileSnapshot[] | null>
}

export const PREVIEW_CHANNEL = 'appsbuilder:preview'
export const PREVIEW_SNAP_KEY = 'appsbuilder:preview:snap'

/* ------------------------------------------------------------------ */
/* Serialización                                                       */
/* ------------------------------------------------------------------ */

function readFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function fileToSnapshot(file: File | null): Promise<FileSnapshot | null> {
  if (!file) return null
  return { name: file.name, type: file.type, dataUrl: await readFileToDataUrl(file) }
}

async function dataUrlToFile(snap: FileSnapshot): Promise<File> {
  const res = await fetch(snap.dataUrl)
  const blob = await res.blob()
  return new File([blob], snap.name, { type: snap.type })
}

export async function serializeState(state: BuilderState): Promise<PreviewSnapshot> {
  const [logo, favicon] = await Promise.all([
    fileToSnapshot(state.config.logo),
    fileToSnapshot(state.config.favicon),
  ])

  const imagenes: Record<string, FileSnapshot | FileSnapshot[] | null> = {}
  for (const [key, file] of Object.entries(state.imagenes)) {
    if (Array.isArray(file)) {
      imagenes[key] = (await Promise.all(file.map((f) => fileToSnapshot(f)))).filter(
        (s): s is FileSnapshot => s !== null
      )
    } else {
      imagenes[key] = await fileToSnapshot(file)
    }
  }

  return {
    product: state.product,
    template: state.template,
    selectedBlocks: state.selectedBlocks,
    config: {
      name: state.config.name,
      slug: state.config.slug,
      colors: state.config.colors,
      fonts: state.config.fonts,
      logo,
      favicon,
    },
    textos: state.textos,
    imagenes,
  }
}

export async function deserializeSnapshot(snap: PreviewSnapshot): Promise<Partial<BuilderState>> {
  const [logo, favicon] = await Promise.all([
    snap.config.logo ? dataUrlToFile(snap.config.logo) : null,
    snap.config.favicon ? dataUrlToFile(snap.config.favicon) : null,
  ])

  const imagenes: BuilderState['imagenes'] = {}
  for (const [key, fileSnap] of Object.entries(snap.imagenes)) {
    if (Array.isArray(fileSnap)) {
      imagenes[key] = await Promise.all(fileSnap.map((s) => dataUrlToFile(s)))
    } else {
      imagenes[key] = fileSnap ? await dataUrlToFile(fileSnap) : null
    }
  }

  return {
    product: snap.product,
    template: snap.template,
    selectedBlocks: snap.selectedBlocks,
    config: { ...snap.config, logo, favicon },
    textos: snap.textos,
    imagenes,
  }
}

/* ------------------------------------------------------------------ */
/* Publicador (ventana del wizard)                                     */
/* ------------------------------------------------------------------ */

let broadcastChannel: BroadcastChannel | null = null
let broadcastTimer: ReturnType<typeof setTimeout> | null = null

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null
  if (!broadcastChannel) broadcastChannel = new BroadcastChannel(PREVIEW_CHANNEL)
  return broadcastChannel
}

function persistSnapshot(snap: PreviewSnapshot): void {
  try {
    localStorage.setItem(PREVIEW_SNAP_KEY, JSON.stringify(snap))
  } catch {
    // localStorage puede fallar si el snapshot excede el límite (imágenes grandes)
  }
}

/**
 * Suscribe el wizard al store y publica el estado hacia cualquier ventana de
 * preview abierta. Devuelve la función de limpieza.
 */
export function publishPreviewBridge(): () => void {
  if (typeof window === 'undefined') return () => {}

  let lastSnapJson = ''

  const publish = () => {
    if (broadcastTimer) return
    broadcastTimer = setTimeout(async () => {
      broadcastTimer = null
      const snap = await serializeState(useBuilderStore.getState())
      const json = JSON.stringify(snap)
      if (json === lastSnapJson) return
      lastSnapJson = json
      const channel = getChannel()
      channel?.postMessage(snap)
      persistSnapshot(snap)
    }, 150)
  }

  const unsubscribe = useBuilderStore.subscribe(publish)

  // Publica el estado inicial (en caso de que la ventana de preview se abra
  // sin que el usuario haya hecho cambios desde que cargó el wizard).
  publish()

  return () => {
    if (broadcastTimer) clearTimeout(broadcastTimer)
    unsubscribe?.()
    broadcastChannel?.close()
    broadcastChannel = null
  }
}

/* ------------------------------------------------------------------ */
/* Consumidor (ventana de preview)                                     */
/* ------------------------------------------------------------------ */

/**
 * En la ventana de preview: hidrata el store desde el último snapshot
 * guardado y luego se mantiene sincronizada por BroadcastChannel.
 */
export function subscribePreviewBridge(): () => void {
  if (typeof window === 'undefined') return () => {}

  const channel = getChannel()
  const apply = (snap: PreviewSnapshot) => {
    deserializeSnapshot(snap).then((partial) => {
      useBuilderStore.setState(partial)
    })
  }

  // Snapshot inicial (ventana recién abierta antes de recibir el 1er mensaje)
  const stored = localStorage.getItem(PREVIEW_SNAP_KEY)
  if (stored) {
    try {
      apply(JSON.parse(stored) as PreviewSnapshot)
    } catch {
      // snapshot corrupto: esperar al primer mensaje del canal
    }
  }

  channel?.addEventListener('message', (event: MessageEvent<PreviewSnapshot>) => {
    if (event.data && 'product' in event.data) apply(event.data)
  })

  return () => {
    channel?.close()
    broadcastChannel = null
  }
}