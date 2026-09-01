'use client'

import { useBuilderStore } from '../stores/builderStore'
import { PRODUCT_BLOCKS, BLOCK_LABELS } from '../lib/constants'

const templateMeta = {
  basic: {
    title: 'Básico',
    description: 'Setup mínimo para empezar rápido',
    level: 'lv-w',
  },
  standard: {
    title: 'Estándar',
    description: 'La mayoría de proyectos',
    level: 'lv-o',
  },
  premium: {
    title: 'Premium',
    description: 'Todo incluido',
    level: 'lv-e',
  },
} as const

export function TemplateSelector() {
  const { product, template, setTemplate } = useBuilderStore()

  if (!product) return null

  const templates = ['basic', 'standard', 'premium'] as const

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="lbl">Elegí la plantilla</h2>
        <p className="hint">Cada plantilla incluye diferentes bloques</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((t) => {
          const meta = templateMeta[t]
          const blocks = PRODUCT_BLOCKS[product]?.[t] ?? []
          const isSelected = template === t

          return (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`panel text-left p-4 cursor-pointer transition-all ${
                isSelected ? 'border-foreground' : 'hover:border-border2'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs tracking-[0.12em] uppercase lv lv-${t === 'basic' ? 'w' : t === 'standard' ? 'o' : 'e'}`}>
                  {meta.title}
                </span>
                <span className={`text-[10px] ${isSelected ? 'lv-o' : 'text-[#555]'}`}>
                  {isSelected ? '[x]' : '[ ]'}
                </span>
              </div>
              <p className="hint mb-3">{meta.description}</p>

              <div className="flex flex-col gap-2">
                <span className="lbl">Bloques incluidos</span>
                <div className="flex flex-wrap gap-1">
                  {blocks.map((b) => (
                    <span key={b} className="pill pill-s">
                      {BLOCK_LABELS[b] || b}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}