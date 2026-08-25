'use client'

import { BLOCK_FIELDS } from '../lib/constants'
import { useBuilderStore } from '../stores/builderStore'

interface TextEditorProps {
  block: string
  textos: Record<string, string>
  onChange: (block: string, key: string, value: string) => void
}

export function TextEditor({ block, textos, onChange }: TextEditorProps) {
  const fields = BLOCK_FIELDS[block] || []

  if (fields.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-white/10 bg-card">
        <p className="text-xs text-white/30">No hay campos de texto para este bloque</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1">
          <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
            {field.label}
          </label>
          <input
            type="text"
            value={textos[field.key] || ''}
            onChange={(e) => onChange(block, field.key, e.target.value)}
            placeholder={field.placeholder}
            className="bg-muted border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      ))}
    </div>
  )
}
