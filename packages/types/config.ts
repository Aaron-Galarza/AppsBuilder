import { DeliveryRange } from './delivery';

/** Horario de un día de la semana (formato "HH:mm") */
export interface DaySchedule {
  /** Clave en inglés: "monday", "tuesday", ... */
  day: string;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

export interface Schedule {
  timezone: string;
  days: DaySchedule[];
}

/** Configuración de recargo por lluvia */
export interface RainConfig {
  enabled: boolean;
  extraCost: number;
}

/**
 * Configuración del negocio servida por el backend
 * (GET /api/config/status) y editable desde ConfigTab.
 * Nota: la config visual inyectada por AppsBuilder es ProjectConfig (@saas/configs).
 */
export interface StoreConfig {
  isOpen: boolean;
  /** Botón panic: cierre de emergencia */
  emergencyClosed: boolean;
  bannerUrl?: string;
  rain: RainConfig;
  schedule: Schedule;
  deliveryRanges: DeliveryRange[];
}
