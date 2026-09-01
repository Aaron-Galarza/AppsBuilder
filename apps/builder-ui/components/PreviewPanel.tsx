'use client'

import { useBuilderStore } from '../stores/builderStore'
import { BLOCK_LABELS } from '../lib/constants'

export function PreviewPanel() {
  const { useDemoData, product, template, selectedBlocks, config, textos } = useBuilderStore()

  return (
    <div className="panel p-4 flex flex-col gap-3">
      <span className="lbl">Preview</span>

      <div className="kv">
        <span className="k">Producto</span>
        <span className="v">{product || '—'}</span>
      </div>
      <div className="kv">
        <span className="k">Plantilla</span>
        <span className="v">{template || '—'}</span>
      </div>

      {config.name && (
        <div className="panel py-2 px-1 text-center">
          <p
            className="text-sm truncate"
            style={{ fontFamily: config.fonts.heading, color: config.colors.primary }}
          >
            {config.name}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="lbl">Colores</span>
        <div className="flex gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border border-border2" style={{ backgroundColor: config.colors.primary }} />
            <span className="text-[10px] text-muted-foreground">P</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border border-border2" style={{ backgroundColor: config.colors.secondary }} />
            <span className="text-[10px] text-muted-foreground">S</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border border-border2" style={{ backgroundColor: config.colors.accent }} />
            <span className="text-[10px] text-muted-foreground">A</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="lbl">Bloques seleccionados</span>
        <div className="flex flex-wrap gap-1">
          {selectedBlocks.length === 0 ? (
            <span className="text-[10px] text-[#555]">Ninguno</span>
          ) : (
            selectedBlocks.map((b) => (
              <span key={b} className="pill pill-s">{BLOCK_LABELS[b] || b}</span>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="lbl">Estado</span>
        <div className="flex flex-col gap-1">
          <span className="kv border-none py-0">
            <span className="k">Textos</span>
            <span className={`v ${Object.keys(textos).length > 0 ? 'lv-o' : 'text-[#555]'}`}>
              {Object.keys(textos).length > 0 ? 'OK' : '—'}
            </span>
          </span>
          <span className="kv border-none py-0">
            <span className="k">Datos demo</span>
            <span className={`v ${useDemoData ? 'lv-o' : 'text-[#555]'}`}>
              {useDemoData ? 'ACTIVO' : '—'}
            </span>
          </span>
        </div>
      </div>

      {Object.keys(textos).length > 0 && (
        <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
          <span className="lbl">Textos</span>
          {Object.entries(textos).map(([block, fields]) => (
            <div key={block} className="kv border-none py-0">
              <span className="k">{BLOCK_LABELS[block] || block}</span>
              <span className="v text-muted-foreground">
                {Object.entries(fields).map(([, val]) => val).filter(Boolean).length}/{Object.keys(fields).length}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}