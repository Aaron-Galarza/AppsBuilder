'use client'

import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1 w-full px-4 py-3">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const isActive = step === currentStep
        const isCompleted = step < currentStep

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-primary text-black'
                    : isActive
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-white/5 text-white/30 border border-white/10'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step}
              </div>
              <span
                className={`text-[10px] font-medium hidden sm:block ${
                  isActive ? 'text-primary' : isCompleted ? 'text-white/60' : 'text-white/25'
                }`}
              >
                {labels[i] || `Paso ${step}`}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 rounded-full transition-colors ${
                  isCompleted ? 'bg-primary' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
