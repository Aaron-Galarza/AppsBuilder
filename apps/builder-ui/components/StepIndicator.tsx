'use client'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  const pct = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="px-4 pt-3">
      <div className="navtabs">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1
          const isActive = step === currentStep
          const isCompleted = step < currentStep

          return (
            <span
              key={step}
              className={`ntab ${isActive ? 'act' : ''} ${isCompleted ? 'done' : ''}`}
            >
              {isCompleted ? '✓ ' : isActive ? '▸ ' : ''}
              {labels[i] || `Paso ${step}`}
            </span>
          )
        })}
      </div>
      <div className="bar-wrap mb-1">
        <div className={`bar ${isFinished(currentStep, totalSteps) ? 'bar-ok' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function isFinished(step: number, total: number): boolean {
  return step >= total
}