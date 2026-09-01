'use client'

import { BLOCK_LABELS, BLOCK_DESCRIPTIONS } from '../lib/constants'

interface BloqueCheckboxProps {
  block: string
  isSelected: boolean
  isMandatory: boolean
  onToggle: (block: string) => void
}

export function BloqueCheckbox({ block, isSelected, isMandatory, onToggle }: BloqueCheckboxProps) {
  const label = BLOCK_LABELS[block] || block
  const description = BLOCK_DESCRIPTIONS[block] || ''

  return (
    <button
      onClick={() => !isMandatory && onToggle(block)}
      disabled={isMandatory}
      className={`panel flex items-start gap-3 p-3 text-left w-full transition-all ${
        isMandatory
          ? 'border-foreground cursor-default'
          : isSelected
          ? 'border-foreground cursor-pointer'
          : 'hover:border-border2 cursor-pointer'
      }`}
    >
      <span
        className={`text-xs mt-0.5 shrink-0 font-bold ${
          isMandatory ? 'lv-w' : isSelected ? 'lv-o' : 'text-[#555]'
        }`}
      >
        {isSelected ? '[x]' : '[ ]'}
      </span>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs uppercase tracking-[0.1em] ${isSelected || isMandatory ? 'text-foreground' : 'text-muted-foreground'}`}>
            {label}
          </span>
          {isMandatory && <span className="pill pill-w">Obligatorio</span>}
        </div>
        <span className="hint mt-1">{description}</span>
      </div>
    </button>
  )
}