'use client'

import { FONTS } from '../lib/constants'

interface FontSelectorProps {
  label: string
  value: string
  onChange: (font: string) => void
}

export function FontSelector({ label, value, onChange }: FontSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="lbl">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field cursor-pointer"
      >
        {FONTS.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>
      <div
        className="panel py-2 px-3 text-center text-sm text-muted-foreground"
        style={{ fontFamily: value }}
      >
        {value} — Ejemplo de texto
      </div>
    </div>
  )
}