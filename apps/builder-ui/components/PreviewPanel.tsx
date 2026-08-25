'use client'

import { useBuilderStore } from '../stores/builderStore'
import { BLOCK_LABELS } from '../lib/constants'

export function PreviewPanel() {
  const { product, template, selectedBlocks, config, textos } = useBuilderStore()

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border border-white/10 bg-card">
      <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Preview</h3>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30">Producto:</span>
          <span className="text-xs text-white font-medium">{product || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30">Plantilla:</span>
          <span className="text-xs text-white font-medium">{template || '—'}</span>
        </div>
      </div>

      {config.name && (
        <div className="text-center py-3 border border-white/5 rounded-lg bg-white/5">
          <p className="text-sm font-bold" style={{ fontFamily: config.fonts.heading, color: config.colors.primary }}>
            {config.name}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">Colores:</span>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: config.colors.primary }} />
            <span className="text-[10px] text-white/40">Primary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: config.colors.secondary }} />
            <span className="text-[10px] text-white/40">Secondary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: config.colors.accent }} />
            <span className="text-[10px] text-white/40">Accent</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">Bloques seleccionados:</span>
        <div className="flex flex-wrap gap-1">
          {selectedBlocks.length === 0 ? (
            <span className="text-[10px] text-white/20">Ninguno</span>
          ) : (
            selectedBlocks.map((b) => (
              <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {BLOCK_LABELS[b] || b}
              </span>
            ))
          )}
        </div>
      </div>

      {Object.keys(textos).length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Textos:</span>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {Object.entries(textos).map(([block, fields]) => (
              <div key={block} className="flex flex-col gap-0.5">
                <span className="text-[10px] text-white/40 font-medium">{BLOCK_LABELS[block] || block}</span>
                {Object.entries(fields).map(([key, val]) => (
                  <span key={key} className="text-[10px] text-white/25 pl-2 truncate">
                    {key}: {val || '(vacío)'}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
