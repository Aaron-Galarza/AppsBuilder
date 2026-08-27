'use client'

import { SketchPicker } from 'react-color'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-white/50 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border-2 border-white/10 shrink-0"
          style={{ backgroundColor: value }}
        />
        <div className="flex flex-col gap-1 flex-1">
          <SketchPicker color={value} onChangeComplete={(c) => onChange(c.hex)} style={{ width: '100%', height: '120px' }} />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-muted border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-primary/50"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  )
}
