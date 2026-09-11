'use client'

import { useRef, useState } from 'react'
import { Eye, Monitor, Smartphone, Tablet, X } from 'lucide-react'
import { AppPreview } from '../../lib/preview/sections'

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

export interface PreviewOverlayProps {
  open: boolean
  onClose: () => void
}

export function PreviewOverlay({ open, onClose }: PreviewOverlayProps) {
  const [device, setDevice] = useState<DeviceWidth>('desktop')
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!open) return null

  return (
    <div className="fixed inset-y-0 right-0 z-[60] flex w-1/2 min-w-[420px] max-w-[700px] flex-col border-l border-[#303030] bg-[#0e0e0e] shadow-2xl">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#252525] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Eye size={14} className="shrink-0 text-[#c9a030]" />
          <span className="lbl mb-0">Preview en vivo</span>
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

        <button type="button" onClick={onClose} className="btn" aria-label="Cerrar preview">
          <X size={13} />
          <span className="hidden sm:inline">Cerrar</span>
        </button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 relative bg-[#0a0a0a] overflow-y-auto">
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