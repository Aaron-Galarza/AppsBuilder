import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { parseRange } from '../../utils/dateRange';
import { createOrder, getOrdersByRange, updateOrderStatus } from './service';

/** POST /api/orders — público (checkout web) y manual (admin) */
export const postOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await createOrder(req.body);
  // Respuesta liviana para la pantalla de confirmación
  sendSuccess(
    res,
    {
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      deliveryType: order.deliveryType,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      discount: order.discount,
      deliveryCost: order.deliveryCost,
      surcharge: order.surcharge,
      total: order.total,
    },
    201
  );
});

/** GET /api/orders/admin?range=hoy|ayer|semana|mes */
export const getAdminOrders = asyncHandler(async (req: Request, res: Response) => {
  const range = parseRange(req.query.range);
  const orders = await getOrdersByRange(range);
  sendSuccess(res, orders);
});

/** PUT /api/orders/admin/:id/status {status} */
export const putOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await updateOrderStatus(req.params.id, req.body.status);
  sendSuccess(res, updated);
});
