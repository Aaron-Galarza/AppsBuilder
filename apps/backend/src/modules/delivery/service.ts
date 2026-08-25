import { calculateDistanceKm } from '../../utils/distance';
import { AppError } from '../../utils/AppError';
import { StoreConfig } from '../schedules/model';

export interface DeliveryCalculation {
  distanceKm: number;
  deliveryCost: number;
  rainSurcharge: number;
  details: string;
}

/**
 * Costo de envío = rango de km configurado + recargo por lluvia (si está activo).
 * El rango se elige por el primero cuyo maxKm cubre la distancia; si excede el
 * último rango configurado, se usa ese mismo precio (o se rechaza si no hay rangos).
 */
export async function calculateDelivery(lat: number, lng: number): Promise<DeliveryCalculation> {
  const config = await StoreConfig.getOrCreateConfig();

  const { distanceKm, source } = await calculateDistanceKm(lat, lng);

  const ranges = [...config.deliveryRanges].sort((a, b) => a.minKm - b.minKm);
  if (ranges.length === 0) {
    throw new AppError(
      409,
      'El local no tiene zonas de delivery configuradas. Coordiná el envío por WhatsApp.'
    );
  }

  const match =
    ranges.find((r) => distanceKm >= r.minKm && distanceKm <= r.maxKm) ?? ranges[ranges.length - 1];

  let deliveryCost = match.cost;
  let rainSurcharge = 0;

  if (config.rain.enabled && config.rain.extraCost > 0) {
    rainSurcharge = config.rain.extraCost;
    deliveryCost += rainSurcharge;
  }

  return {
    distanceKm,
    deliveryCost,
    rainSurcharge,
    details: `${distanceKm.toFixed(2)}km · ${source === 'mapbox' ? 'ruta' : 'aprox'}${
      rainSurcharge > 0 ? ' · +lluvia' : ''
    }`,
  };
}
