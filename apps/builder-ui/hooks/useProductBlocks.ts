import { PRODUCT_BLOCKS, MANDATORY_BLOCKS } from '../lib/constants'

export function useProductBlocks(
  product: 'webOrders' | 'landingPages' | null,
  template: 'basic' | 'standard' | 'premium' | null
) {
  if (!product || !template) {
    return { available: [], mandatory: [] }
  }

  const available: string[] = [...(PRODUCT_BLOCKS[product]?.[template] ?? [])]
  const mandatory: string[] = [...(MANDATORY_BLOCKS[product] ?? [])]

  return { available, mandatory }
}
