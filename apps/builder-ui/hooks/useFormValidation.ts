import { useBuilderStore } from '../stores/builderStore'

interface Validation {
  isValid: boolean
  errors: string[]
}

export function useFormValidation(step: number): Validation {
  const { product, template, selectedBlocks, config, textos } = useBuilderStore()

  switch (step) {
    case 1: {
      const errors: string[] = []
      if (!product) errors.push('Seleccioná un producto')
      return { isValid: errors.length === 0, errors }
    }

    case 2: {
      const errors: string[] = []
      if (!template) errors.push('Seleccioná una plantilla')
      return { isValid: errors.length === 0, errors }
    }

    case 3: {
      const errors: string[] = []
      if (selectedBlocks.length === 0) errors.push('Seleccioná al menos un bloque')
      return { isValid: errors.length === 0, errors }
    }

    case 4: {
      const errors: string[] = []
      if (!config.name.trim()) errors.push('El nombre del proyecto es obligatorio')
      if (!config.slug.trim()) errors.push('El slug del proyecto es obligatorio')
      return { isValid: errors.length === 0, errors }
    }

    case 5: {
      const errors: string[] = []
      if (selectedBlocks.length === 0) {
        errors.push('No hay bloques seleccionados')
        return { isValid: false, errors }
      }
      for (const block of selectedBlocks) {
        const blockTextos = textos[block]
        if (!blockTextos || Object.keys(blockTextos).length === 0) {
          errors.push(`El bloque "${block}" no tiene textos configurados`)
        }
      }
      return { isValid: errors.length === 0, errors }
    }

    case 6:
    case 7:
      return { isValid: true, errors: [] }

    default:
      return { isValid: false, errors: ['Paso desconocido'] }
  }
}
