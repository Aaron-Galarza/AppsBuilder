import { Router } from 'express';
import { isDBReady } from '../config/db';
import productsRouter from '../modules/products/routes';
import categoriesRouter from '../modules/categories/routes';
import addonsRouter from '../modules/adicionales/routes';
import ordersRouter from '../modules/orders/routes';
import deliveryRouter from '../modules/delivery/routes';
import couponsRouter from '../modules/coupons/routes';
import analyticsRouter from '../modules/analytics/routes';
import galleryRouter from '../modules/gallery/routes';
import geocodingRouter from '../modules/geocoding/routes';
import usersRouter from '../modules/users/routes';
import configRouter from '../modules/schedules/routes';

const mainRouter: Router = Router();

mainRouter.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', db: isDBReady() ? 'up' : 'down', timestamp: new Date().toISOString() },
  });
});

mainRouter.use('/products', productsRouter);
mainRouter.use('/categories', categoriesRouter);
mainRouter.use('/addons', addonsRouter);
mainRouter.use('/orders', ordersRouter);
mainRouter.use('/delivery', deliveryRouter);
mainRouter.use('/coupons', couponsRouter);
mainRouter.use('/analytics', analyticsRouter);
mainRouter.use('/gallery', galleryRouter);
mainRouter.use('/geocoding', geocodingRouter);
mainRouter.use('/users', usersRouter);
mainRouter.use('/config', configRouter);

export default mainRouter;
