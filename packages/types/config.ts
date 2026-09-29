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
/**
 * Modo de estado del local:
 * - `schedule`: abierto/cerrado según el horario del día (standard/premium).
 * - `manual`: abierto salvo que el dueño lo cierre con el botón (basic).
 */
export type StoreStatusMode = 'manual' | 'schedule';

/**
 * Origen del modo de estado:
 * - `env`: lo define STATUS_MODE, que el generador inyecta según la plantilla.
 * - `admin`: el dueño lo eligió a mano en ConfigTab y el .env deja de mandar.
 */
export type StoreStatusModeSource = 'env' | 'admin';

export interface StoreConfig {
  isOpen: boolean;
  /** Botón panic: cierre de emergencia */
  emergencyClosed: boolean;
  /** Modo de estado del local (default 'schedule') */
  statusMode: StoreStatusMode;
  bannerUrl?: string;
  rain: RainConfig;
  schedule: Schedule;
  deliveryRanges: DeliveryRange[];
}
