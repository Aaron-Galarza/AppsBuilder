'use client'

import { Database } from 'lucide-react'
import { useBuilderStore } from '../stores/builderStore'

const TOOLTIP_ON =
  'Datos demo cargados: producto, plantilla, bloques, textos e imÃ¡genes. VolvÃ© a clickear para re-aplicar.'
const TOOLTIP_OFF =
  'Cargar datos demo: detecta Producto â†’ Plantilla â†’ Bloques y completa textos, imÃ¡genes y dataset simulado.'

export function DemoToggle() {
  const useDemoData = useBuilderStore((s) => s.useDemoData)
  const applyDemo = useBuilderStore((s) => s.applyDemo)
  const setUseDemoData = useBuilderStore((s) => s.setUseDemoData)

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={applyDemo}
        title={useDemoData ? TOOLTIP_ON : TOOLTIP_OFF}
        className={useDemoData ? 'btn btn-ok' : 'btn btn-warn'}
      >
        <Database className="w-3.5 h-3.5" strokeWidth={1.5} />
        {useDemoData ? 'Datos demo cargados' : 'Rellenar con datos demo'}
      </button>
      {useDemoData && (
        <button
          type="button"
          onClick={() => setUseDemoData(false)}
          title="Quitar modo demo"
          className="btn"
        >
          X
        </button>
      )}
    </div>
  )
}