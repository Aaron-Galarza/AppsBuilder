'use client'

import { BLOCK_FIELDS } from '../lib/constants'

interface TextEditorProps {
  block: string
  textos: Record<string, string>
  onChange: (block: string, key: string, value: string) => void
}

export function TextEditor({ block, textos, onChange }: TextEditorProps) {
  const fields = BLOCK_FIELDS[block] || []

  if (fields.length === 0) {
    return (
      <div className="panel px-4 py-3">
        <p className="hint">Sin campos de texto para este bloque</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1">
          <label className="lbl">{field.label}</label>
          <input
            type="text"
            value={textos[field.key] || ''}
            onChange={(e) => onChange(block, field.key, e.target.value)}
            placeholder={field.placeholder}
            className="field"
          />
        </div>
      ))}
    </div>
  )
}