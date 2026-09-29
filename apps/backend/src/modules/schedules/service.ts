import { AppError } from '../../utils/AppError';
import { argWeekday, isArgNowBetween } from '../../utils/timezone';
import type { StoreStatusMode } from '@saas/types';
import { StoreConfig } from './model';

export interface StoreStatus {
  isOpen: boolean;
  bannerUrl: string;
  emergencyClosed: boolean;
}

/**
 * ¿El local está atendiendo ahora?
 * - emergencyClosed → false (botón de apertura/cierre manual)
 * - statusMode 'manual' → true (el local solo abre/cierra con el botón, sin horarios)
 * - schedule del día: closed o fuera de horario → false
 */
export async function checkStoreStatus(): Promise<StoreStatus> {
  const config = await StoreConfig.getOrCreateConfig();

  if (config.emergencyClosed) {
    return { isOpen: false, bannerUrl: config.bannerUrl ?? '', emergencyClosed: true };
  }

  // Modo manual (basic): abierto salvo que el dueño lo haya cerrado
  if (config.statusMode !== 'schedule') {
    return { isOpen: true, bannerUrl: config.bannerUrl ?? '', emergencyClosed: false };
  }

  const today = config.schedule.days.find((d) => d.day === argWeekday());
  const openBySchedule = Boolean(
    today && !today.closed && isArgNowBetween(today.openTime, today.closeTime)
  );

  return {
    isOpen: openBySchedule,
    bannerUrl: config.bannerUrl ?? '',
    emergencyClosed: false,
  };
}

/** Lanza 423 (Locked) si el local no atiende — usado por createOrder público */
export async function assertStoreOpen(): Promise<void> {
  const status = await checkStoreStatus();
  if (!status.isOpen) {
    throw new AppError(423, 'El local está cerrado en este momento');
  }
}

/**
 * Aplica el STATUS_MODE del .env al config singleton mientras nadie lo haya elegido a mano.
 *
 * El generador inyecta STATUS_MODE según la plantilla ('manual' para basic, 'schedule'
 * para el resto), pero el auto-seed SOLO corre si la base está vacía. Sin esta
 * sincronización, una base ya sembrada conserva el default del schema ('schedule') y en
 * basic el botón abrir/cerrar no puede abrir nunca el local: checkStoreStatus() decide por
 * horario (20:00-23:59 en el seed) y da el mismo resultado con el local abierto o cerrado.
 */
export async function syncStatusModeFromEnv(): Promise<void> {
  const envMode: StoreStatusMode = process.env.STATUS_MODE === 'manual' ? 'manual' : 'schedule';
  const config = await StoreConfig.getOrCreateConfig();

  // Si el dueño eligió el modo a mano en ConfigTab, el .env deja de mandar.
  if (config.statusModeSource === 'admin') return;
  if (config.statusMode === envMode) return;

  config.statusMode = envMode;
  config.statusModeSource = 'env';
  await config.save();
  console.log(`[schedules] statusMode aplicado desde STATUS_MODE: ${envMode}`);
}
