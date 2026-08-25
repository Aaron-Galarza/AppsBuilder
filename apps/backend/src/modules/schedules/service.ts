import { AppError } from '../../utils/AppError';
import { argWeekday, isArgNowBetween } from '../../utils/timezone';
import { StoreConfig } from './model';

export interface StoreStatus {
  isOpen: boolean;
  bannerUrl: string;
  emergencyClosed: boolean;
}

/**
 * ¿El local está atendiendo ahora?
 * - emergencyClosed → false (botón panic)
 * - schedule del día: closed o fuera de horario → false
 */
export async function checkStoreStatus(): Promise<StoreStatus> {
  const config = await StoreConfig.getOrCreateConfig();

  if (config.emergencyClosed) {
    return { isOpen: false, bannerUrl: config.bannerUrl ?? '', emergencyClosed: true };
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
