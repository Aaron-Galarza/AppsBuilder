'use client'

import { useRouter } from 'next/router'
import { StepIndicator } from '../../components/StepIndicator'
import { ProductSelector } from '../../components/ProductSelector'
import { DemoToggle } from '../../components/DemoToggle'
import { useBuilderStore } from '../../stores/builderStore'
import { useFormValidation } from '../../hooks/useFormValidation'

const STEP_LABELS = ['Producto', 'Plantilla', 'Bloques', 'Config', 'Textos', 'Imágenes', 'Descargar']

export default function BuilderIndex() {
  const router = useRouter()
  const store = useBuilderStore()
  const { isValid } = useFormValidation(1)

  const handleNext = () => {
    if (isValid) {
      router.push('/builder/2')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border">
        <button
          onClick={() => router.push('/')}
          className="btn btn-err"
          title="Cancelar y volver al inicio"
        >
          Cancelar
        </button>
        <DemoToggle />
        <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
          Paso 1 / 7
        </span>
      </div>

      <StepIndicator currentStep={1} totalSteps={7} labels={STEP_LABELS} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {store.useDemoData && (
            <div className="mb-4">
              <span className="pill pill-ok">
                Demo activo · producto, plantilla, bloques y textos ya cargados
              </span>
            </div>
          )}
          <ProductSelector />

          <div className="flex justify-end mt-8">
            <button onClick={handleNext} disabled={!isValid} className="btn btn-ok">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}