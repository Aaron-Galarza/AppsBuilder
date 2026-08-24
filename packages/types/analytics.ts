export interface AnalyticsPaymentBreakdown {
  cash: number;
  debito: number;
  credito: number;
  transferencia: number;
}

/** Métricas agregadas de un día (fecha "YYYY-MM-DD" en timezone Argentina) */
export interface AnalyticsDaily {
  date: string;
  orders: number;
  revenue: number;
  delivered: number;
  cancelled: number;
  byPaymentMethod: AnalyticsPaymentBreakdown;
}

export interface AnalyticsTopProduct {
  productId: string;
  title: string;
  quantity: number;
  revenue: number;
}

/** Métricas por rango de fechas (hoy/ayer/semana/mes) para el OverviewTab */
export interface AnalyticsStats {
  range: { from: string; to: string };
  totalOrders: number;
  totalRevenue: number;
  delivered: number;
  byPaymentMethod: AnalyticsPaymentBreakdown;
  topProducts: AnalyticsTopProduct[];
}

/** Cache local de métricas diarias con expiración */
export interface AnalyticsCache {
  data: AnalyticsDaily[];
  updatedAt: number;
  expiresAt: number;
}
