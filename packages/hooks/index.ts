// API client
export { API_URL, apiFetch, authHeaders } from './lib/api';
export type { ApiEnvelope } from './lib/api';

// Stores de estado global
export { useCartStore } from './useCartStore';
export type { DeliveryCoordinates } from './useCartStore';
export { useAuthStore } from './useAuthStore';

// Cliente (público)
export { useMenu } from './useMenu';
export { useStoreStatus } from './useStoreStatus';
export { useCheckout } from './useCheckout';
export { useDelivery } from './useDelivery';
export { useAddressSearch } from './useAddressSearch';

// Admin
export { useAdminCrud } from './useAdminCrud';
export type { UseAdminCrudOptions, UseAdminCrudReturn } from './useAdminCrud';
export { useAdminOrders } from './useAdminOrders';
export type { AdminRange } from './useAdminOrders';
export { useAdminMenu } from './useAdminMenu';
export { useAdminConfig } from './useAdminConfig';
export { useAdminOverview } from './useAdminOverview';
export type { OverviewRange } from './useAdminOverview';
export { useAdminCoupons } from './useAdminCoupons';
export type { CouponForm } from './useAdminCoupons';
export { useAdminGallery } from './useAdminGallery';
export type { GalleryImage } from './useAdminGallery';
export { useQuickOrder } from './useQuickOrder';

// Utilidades de impresión
export { generateComandaHTML, printComanda } from './utils/comanda';
