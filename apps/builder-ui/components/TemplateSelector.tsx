'use client'

import { useBuilderStore } from '../stores/builderStore'
import { PRODUCT_BLOCKS, BLOCK_LABELS } from '../lib/constants'

const templateMeta = {
  basic: {
    title: 'Básico',
    description: 'Setup mínimo para empezar rápido',
    color: 'text-green-400',
    border: 'border-green-400/30',
  },
  standard: {
    title: 'Estándar',
    description: 'La mayoría de proyectos',
    color: 'text-blue-400',
    border: 'border-blue-400/30',
  },
  premium: {
    title: 'Premium',
    description: 'Todo incluido',
    color: 'text-purple-400',
    border: 'border-purple-400/30',
  },
} as const

export function TemplateSelector() {
  const { product, template, setTemplate } = useBuilderStore()

  if (!product) return null

  const templates = ['basic', 'standard', 'premium'] as const

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white">Elegí la plantilla</h2>
        <p className="text-sm text-white/40 mt-1">Cada plantilla incluye diferentes bloques</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {templates.map((t) => {
          const meta = templateMeta[t]
          const blocks = PRODUCT_BLOCKS[product]?.[t] ?? []
          const isSelected = template === t

          return (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`relative flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? `${meta.border} bg-white/5`
                  : 'border-white/10 bg-card hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>
                {meta.title}
              </span>
              <p className="text-xs text-white/40 mt-1 mb-3">{meta.description}</p>

              <div className="flex flex-col gap-1 mt-auto w-full">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Bloques incluidos:</span>
                <div className="flex flex-wrap gap-1">
                  {blocks.map((b) => (
                    <span
                      key={b}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10"
                    >
                      {BLOCK_LABELS[b] || b}
                    </span>
                  ))}
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
