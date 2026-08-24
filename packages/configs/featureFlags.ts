export type ProductKind = 'webOrders' | 'landingPages' | 'webInstitutional';

/**
 * Flags por producto: determinan qué módulos incluye el ZIP
 * y qué secciones muestra el builder (context-aware).
 */
export interface FeatureFlags {
  /** Módulo delivery (Mapbox + cálculo de envío) */
  hasDelivery: boolean;
  /** Panel de administración */
  hasAdmin: boolean;
  /** Sistema de cupones */
  hasCoupons: boolean;
}

export const PRODUCT_FEATURE_FLAGS: Record<ProductKind, FeatureFlags> = {
  webOrders: {
    hasDelivery: true,
    hasAdmin: true,
    hasCoupons: true,
  },
  landingPages: {
    hasDelivery: false,
    hasAdmin: false,
    hasCoupons: false,
  },
  webInstitutional: {
    hasDelivery: false,
    hasAdmin: false,
    hasCoupons: false,
  },
};

export function getFeatureFlags(product: ProductKind): FeatureFlags {
  return { ...PRODUCT_FEATURE_FLAGS[product] };
}
