'use client'

import { useState } from 'react'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [text, setText] = useState(value)
  const valid = HEX_RE.test(text)

  return (
    <div className="flex flex-col gap-2">
      <label className="lbl">{label}</label>
      <div className="flex items-center gap-2">
        <label
          className="relative w-11 h-8 shrink-0 border border-border2 bg-muted rounded cursor-pointer"
          title="Elegir color"
        >
          <span
            className="absolute inset-1 rounded-sm border border-border2"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={HEX_RE.test(value) ? value : '#000000'}
            onChange={(e) => {
              const next = e.target.value.toUpperCase()
              setText(next)
              onChange(next)
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            const next = e.target.value.toUpperCase()
            setText(next)
            if (HEX_RE.test(next)) onChange(next)
          }}
          onBlur={() => {
            // Al salir del campo, si es válido normaliza al formato guardado.
            setText(HEX_RE.test(text) ? text : value)
          }}
          placeholder="#000000"
          spellCheck={false}
          autoComplete="off"
          className={`field ${valid ? '' : '!border-err !text-err'}`}
        />
      </div>
      {!valid && (
        <span className="hint text-err">Formato inválido — usá #RRGGBB</span>
      )}
    </div>
  )
}