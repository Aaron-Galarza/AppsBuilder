import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { parseRange } from '../../utils/dateRange';
import { getAnalytics } from './service';

/** GET /api/analytics?range=hoy|ayer|semana|mes (admin) */
export const getAnalyticsStats = asyncHandler(async (req: Request, res: Response) => {
  const range = parseRange(req.query.range);
  const stats = await getAnalytics(range);
  sendSuccess(res, stats);
});
