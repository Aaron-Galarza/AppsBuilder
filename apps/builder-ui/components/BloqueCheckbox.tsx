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
      className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all w-full ${
        isMandatory
          ? 'border-primary/30 bg-primary/5 cursor-default'
          : isSelected
          ? 'border-primary bg-primary/5'
          : 'border-white/10 bg-card hover:border-white/20 hover:bg-white/5'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
          isSelected
            ? 'bg-primary border-primary'
            : 'border-white/20 bg-transparent'
        }`}
      >
        {isSelected && (
          <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-white'}`}>
            {label}
          </span>
          {isMandatory && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold uppercase">
              Obligatorio
            </span>
          )}
        </div>
        <span className="text-xs text-white/40">{description}</span>
      </div>
    </button>
  )
}
