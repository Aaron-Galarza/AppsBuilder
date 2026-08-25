import { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { z } from 'zod';
import { StoreConfig } from './model';
import { checkStoreStatus } from './service';

/** GET /api/config/status — público: {isOpen, bannerUrl, emergencyClosed} */
export const getPublicStatus = asyncHandler(async (_req: Request, res: Response) => {
  const status = await checkStoreStatus();
  sendSuccess(res, status);
});

/** GET /api/config — admin: config completa */
export const getConfig = asyncHandler(async (_req: Request, res: Response) => {
  const config = await StoreConfig.getOrCreateConfig();
  sendSuccess(res, config);
});

const scheduleSchema = z.object({
  timezone: z.string().optional(),
  days: z
    .array(
      z.object({
        day: z.string(),
        openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
        closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
        closed: z.boolean(),
      })
    )
    .length(7, 'Se esperan los 7 días'),
});

const rainSchema = z.object({
  enabled: z.boolean(),
  extraCost: z.number().min(0),
});

const deliveryRangeSchema = z.object({
  minKm: z.number().min(0),
  maxKm: z.number().min(0),
  cost: z.number().min(0),
});

const bannerSchema = z.object({ bannerUrl: z.string().trim().max(500) });
const emergencySchema = z.object({ closed: z.boolean() });

/** Bodies completos esperados por los PUT (el schema interior va anidado) */
const scheduleBodySchema = z.object({ schedule: scheduleSchema });
const rainBodySchema = z.object({ rain: rainSchema });

/** PUT /api/config/schedule */
export const updateSchedule = asyncHandler(async (req: Request, res: Response) => {
  const config = await StoreConfig.getOrCreateConfig();
  config.schedule = req.body.schedule;
  await config.save();
  sendSuccess(res, config);
});

/** PUT /api/config/banner */
export const updateBanner = asyncHandler(async (req: Request, res: Response) => {
  const config = await StoreConfig.getOrCreateConfig();
  config.bannerUrl = req.body.bannerUrl;
  await config.save();
  sendSuccess(res, config);
});

/** PUT /api/config/rain */
export const updateRain = asyncHandler(async (req: Request, res: Response) => {
  const config = await StoreConfig.getOrCreateConfig();
  config.rain = req.body.rain;
  await config.save();
  sendSuccess(res, config);
});

/** PUT /api/config/emergency — botón panic */
export const updateEmergency = asyncHandler(async (req: Request, res: Response) => {
  const config = await StoreConfig.getOrCreateConfig();
  config.emergencyClosed = req.body.closed;
  await config.save();

  // Notificar a todos los clientes conectados que el local cambió de estado
  const { getIO } = await import('../../socket/socket');
  getIO().to('public').emit('store-status', {
    isOpen: !config.emergencyClosed,
    emergencyClosed: config.emergencyClosed,
  });

  sendSuccess(res, config);
});

/** POST /api/config/delivery-ranges */
export const addDeliveryRange = asyncHandler(async (req: Request, res: Response) => {
  const config = await StoreConfig.getOrCreateConfig();
  config.deliveryRanges.push(req.body);
  await config.save();
  sendSuccess(res, config, 201);
});

/** DELETE /api/config/delivery-ranges/:id */
export const removeDeliveryRange = asyncHandler(async (req: Request, res: Response) => {
  const config = await StoreConfig.getOrCreateConfig();
  const before = config.deliveryRanges.length;
  config.deliveryRanges = config.deliveryRanges.filter(
    (r) => String(r._id) !== req.params.id
  );
  if (config.deliveryRanges.length === before) throw new AppError(404, 'Rango no encontrado');
  await config.save();
  sendSuccess(res, config);
});

export {
  scheduleBodySchema,
  rainBodySchema,
  deliveryRangeSchema,
  bannerSchema,
  emergencySchema,
};
