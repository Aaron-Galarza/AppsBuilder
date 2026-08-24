export type DiscountType = 'percentage' | 'fixed';

export type PaymentMethod = 'cash' | 'debito' | 'credito' | 'transferencia';

export interface Coupon {
  _id: string;
  /** Código en mayúsculas, ej: "BURGER20" */
  code: string;
  discountType: DiscountType;
  /** Si discountType es 'percentage' → 20 = 20%. Si es 'fixed' → monto en pesos */
  discountValue: number;
  active: boolean;
  /** Días de la semana válidos (0 = domingo, 1 = lunes, ...) */
  validDays?: number[];
  validPaymentMethods?: PaymentMethod[];
}
