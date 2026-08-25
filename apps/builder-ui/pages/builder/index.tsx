'use client'

import { useRouter } from 'next/router'
import { StepIndicator } from '../../components/StepIndicator'
import { ProductSelector } from '../../components/ProductSelector'
import { useBuilderStore } from '../../stores/builderStore'
import { useFormValidation } from '../../hooks/useFormValidation'

const STEP_LABELS = ['Producto', 'Plantilla', 'Bloques', 'Config', 'Textos', 'Imágenes', 'Descargar']

export default function BuilderIndex() {
  const router = useRouter()
  const { isValid } = useFormValidation(1)

  const handleNext = () => {
    if (isValid) {
      router.push('/builder/2')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StepIndicator currentStep={1} totalSteps={7} labels={STEP_LABELS} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <ProductSelector />

          <div className="flex justify-end mt-8">
            <button
              onClick={handleNext}
              disabled={!isValid}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                isValid
                  ? 'bg-primary text-black hover:bg-primary/90 active:scale-[0.98]'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
