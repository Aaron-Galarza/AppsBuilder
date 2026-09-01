'use client'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
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
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          spellCheck={false}
          autoComplete="off"
          className="field"
        />
      </div>
    </div>
  )
}