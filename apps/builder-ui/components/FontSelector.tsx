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
      <label className="text-xs font-bold text-white/50 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-muted border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
      >
        {FONTS.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>
      <div
        className="text-center text-lg font-bold text-white/70 py-2 border border-white/5 rounded-lg bg-white/5"
        style={{ fontFamily: value }}
      >
        {value} — Ejemplo de texto
      </div>
    </div>
  )
}
