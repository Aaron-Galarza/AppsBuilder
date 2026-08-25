import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { calculateDelivery } from './service';

/** POST /api/delivery/calculate {lat,lng} → {distanceKm, deliveryCost, ...} */
export const calculateDeliveryCost = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = req.body as { lat: number; lng: number };
  const calculation = await calculateDelivery(lat, lng);
  sendSuccess(res, calculation);
});
