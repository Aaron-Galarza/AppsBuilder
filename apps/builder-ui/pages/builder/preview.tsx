'use client'

import { useEffect, useRef, useState } from 'react'
import { Monitor, Smartphone, Tablet } from 'lucide-react'
import { AppPreview } from '../../lib/preview/sections'
import { subscribePreviewBridge } from '../../lib/previewWindow'
import { useBuilderStore } from '../../stores/builderStore'
import { PRODUCT_BLOCKS, BLOCK_LABELS } from '../../lib/constants'

type DeviceWidth = 'desktop' | 'tablet' | 'mobile'

const DEVICE_WIDTH: Record<DeviceWidth, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
}

const DEVICES: { id: DeviceWidth; label: string; icon: typeof Monitor }[] = [
  { id: 'desktop', label: 'Escritorio', icon: Monitor },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'mobile', label: 'Celular', icon: Smartphone },
]

/**
 * Ventana separada de preview, abierta con window.open('/builder/preview').
 * Se sincroniza en vivo con el wizard vía BroadcastChannel: se puede mover a
 * otro monitor, cambiar la resolución o abrir DevTools sin mezclar con el wizard.
 */
export default function PreviewStandalonePage() {
  const [device, setDevice] = useState<DeviceWidth>('desktop')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { product, template, selectedBlocks } = useBuilderStore()

  useEffect(() => subscribePreviewBridge(), [])

  const hasSelection = Boolean(product && template)
  const blocks = product && template ? (PRODUCT_BLOCKS[product]?.[template] ?? []) : []

  return (
    <div className="flex min-h-screen flex-col bg-[#0e0e0e]">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#252525] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="lbl mb-0">Preview en vivo</span>
          <span className="text-[10px] text-[#666]">
            {product && template ? `${product} · ${template}` : 'sin selección'}
          </span>
        </div>

        {hasSelection && (
          <div className="flex min-w-0 items-center gap-2">
            <div className="hidden min-w-0 items-center gap-1 md:flex">
              {blocks.map((b) => (
                <span
                  key={b}
                  className={`pill ${selectedBlocks.includes(b) ? 'pill-s' : 'pill'}`}
                >
                  {BLOCK_LABELS[b] || b}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {DEVICES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDevice(id)}
                  title={label}
                  aria-label={`Ancho ${label}`}
                  className={`flex h-7 w-7 items-center justify-center rounded border transition ${
                    device === id
                      ? 'border-[#555555] bg-[#1c1c1c] text-[#ffffff]'
                      : 'border-[#252525] bg-none text-[#888888] hover:text-[#d0d0d0]'
                  }`}
                >
                  <Icon size={13} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto bg-[#0a0a0a]">
        <div
          className="mx-auto shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-[max-width] duration-200"
          style={{ maxWidth: DEVICE_WIDTH[device], minHeight: '100%' }}
        >
          <AppPreview scrollRef={scrollRef} />
        </div>
      </div>
    </div>
  )
}