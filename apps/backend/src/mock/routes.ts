/**
 * ============================================================================
 * MOCK ROUTES - Rutas API que responden con datos de data.json
 * ============================================================================
 *
 * Estas rutas se montan cuando MongoDB NO está disponible.
 * Responden exactamente igual que las rutas reales, pero usando datos mock.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CÓMO FUNCIONA:
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. El servidor intenta conectar a MongoDB
 * 2. Si falla, se montan estas rutas ANTES de las rutas reales
 * 3. Las rutas mock interceptan las peticiones y devuelven datos de data.json
 * 4. Las operaciones de escritura (POST/PUT/DELETE) modifican el store en memoria
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ENDPOINTS SOPORTADOS:
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Públicos:
 *   GET  /api/products/public
 *   GET  /api/categories/public
 *   GET  /api/addons/public
 *   GET  /api/config/status
 *   POST /api/delivery/calculate
 *   POST /api/coupons/validate/:code
 *
 * Admin (sin auth real, solo para testing):
 *   GET  /api/products/admin
 *   POST /api/products/admin
 *   PUT  /api/products/admin/toggleActive/:id
 *   PUT  /api/products/admin/:id
 *   DELETE /api/products/admin/:id
 *   GET  /api/orders/admin
 *   GET  /api/analytics
 *   GET  /api/coupons/admin
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CÓMO REVERTIR:
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. Eliminar o renombrar apps/backend/src/mock/ (todo el directorio)
 * 2. Configurar MONGODB_URI en .env
 * 3. Ejecutar: pnpm --filter @saas/backend seed
 * 4. Reiniciar el servidor
 */

import { Router, Request, Response } from 'express';
import { getCollection, isMockActive } from './store';

const router: ReturnType<typeof Router> = Router();

// ═══════════════════════════════════════════════════════════════════════════
// Helper: envolver respuesta en envelope {success, data}
// ═══════════════════════════════════════════════════════════════════════════

function ok(res: Response, data: unknown) {
  return res.json({ success: true, data });
}

function fail(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

// ═══════════════════════════════════════════════════════════════════════════
// RUTAS PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════════

/** GET /api/products/public - Productos disponibles */
router.get('/api/products/public', (_req: Request, res: Response) => {
  const products = getCollection('products').find({ available: true });
  return ok(res, products);
});

/** GET /api/categories/public - Categorías activas */
router.get('/api/categories/public', (_req: Request, res: Response) => {
  const categories = getCollection('categories').find({ active: true });
  return ok(res, categories);
});

/** GET /api/addons/public - Addons disponibles */
router.get('/api/addons/public', (_req: Request, res: Response) => {
  const addons = getCollection('addons').find({ available: true });
  return ok(res, addons);
});

/** GET /api/config/status - Estado del local */
router.get('/api/config/status', (_req: Request, res: Response) => {
  const schedule = getCollection('schedules').find()[0];
  return ok(res, {
    isOpen: schedule ? !schedule.emergencyClosed : true,
    emergencyClosed: schedule?.emergencyClosed ?? false,
    bannerUrl: schedule?.bannerUrl ?? null,
    schedule: schedule ?? null,
  });
});

/** POST /api/delivery/calculate - Calcular costo de envío */
router.post('/api/delivery/calculate', (req: Request, res: Response) => {
  const { lat, lng } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return fail(res, 400, 'Faltan coordenadas (lat, lng)');
  }

  // Simular distancia basada en coordenadas del store (-34.6037, -58.3816)
  const storeLat = -34.6037;
  const storeLng = -58.3816;
  const R = 6371;
  const dLat = ((lat - storeLat) * Math.PI) / 180;
  const dLng = ((lng - storeLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((storeLat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Buscar rango de delivery
  const ranges = getCollection('deliveryRanges').find();
  const match = ranges.find(
    (r) => distanceKm >= (r.minKm as number) && distanceKm <= (r.maxKm as number)
  );
  const deliveryCost = match ? (match.price as number) : (ranges[ranges.length - 1]?.price as number ?? 500);

  return ok(res, { distanceKm: Math.round(distanceKm * 100) / 100, deliveryCost });
});

/** POST /api/coupons/validate/:code - Validar cupón */
router.post('/api/coupons/validate/:code', (req: Request, res: Response) => {
  const { code } = req.params;
  const coupons = getCollection('coupons').find();
  const coupon = coupons.find(
    (c) => (c.code as string).toUpperCase() === code.toUpperCase() && c.active === true
  );

  if (!coupon) {
    return fail(res, 404, 'Cupón no encontrado o inactivo');
  }

  return ok(res, coupon);
});

// ═══════════════════════════════════════════════════════════════════════════
// RUTAS ADMIN (sin auth real para testing)
// ═══════════════════════════════════════════════════════════════════════════

/** GET /api/products/admin - Todos los productos (admin) */
router.get('/api/products/admin', (_req: Request, res: Response) => {
  const products = getCollection('products').find();
  return ok(res, products);
});

/** POST /api/products/admin - Crear producto */
router.post('/api/products/admin', (req: Request, res: Response) => {
  const product = getCollection('products').create(req.body);
  return ok(res, product);
});

/** PUT /api/products/admin/toggleActive/:id - Toggle disponibilidad */
router.put('/api/products/admin/toggleActive/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const product = getCollection('products').findById(id);
  if (!product) return fail(res, 404, 'Producto no encontrado');

  const updated = getCollection('products').findOneAndUpdate(
    { _id: id },
    { available: !product.available },
    { new: true }
  );
  return ok(res, updated);
});

/** PUT /api/products/admin/:id - Actualizar producto */
router.put('/api/products/admin/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = getCollection('products').findOneAndUpdate({ _id: id }, req.body, { new: true });
  if (!updated) return fail(res, 404, 'Producto no encontrado');
  return ok(res, updated);
});

/** DELETE /api/products/admin/:id - Eliminar producto */
router.delete('/api/products/admin/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = getCollection('products').deleteOne(id);
  if (!deleted) return fail(res, 404, 'Producto no encontrado');
  return ok(res, { deleted: true });
});

/** GET /api/orders/admin - Pedidos por rango */
router.get('/api/orders/admin', (req: Request, res: Response) => {
  const range = (req.query.range as string) ?? 'hoy';
  const orders = getCollection('orders').find();
  return ok(res, orders.slice(0, 100));
});

/** GET /api/analytics - Estadísticas */
router.get('/api/analytics', (req: Request, res: Response) => {
  const range = (req.query.range as string) ?? 'hoy';
  const dailies = getCollection('daily').find();

  // Agregar datos de ejemplo
  const stats = {
    range: { from: new Date().toISOString(), to: new Date().toISOString() },
    totalOrders: dailies.reduce((sum, d) => sum + ((d.orders as number) ?? 0), 0),
    totalRevenue: dailies.reduce((sum, d) => sum + ((d.revenue as number) ?? 0), 0),
    delivered: dailies.reduce((sum, d) => sum + ((d.delivered as number) ?? 0), 0),
    byPaymentMethod: {
      cash: dailies.reduce((sum, d) => sum + (((d.byPaymentMethod as Record<string, number>)?.cash) ?? 0), 0),
      debito: dailies.reduce((sum, d) => sum + (((d.byPaymentMethod as Record<string, number>)?.debito) ?? 0), 0),
      credito: dailies.reduce((sum, d) => sum + (((d.byPaymentMethod as Record<string, number>)?.credito) ?? 0), 0),
      transferencia: dailies.reduce((sum, d) => sum + (((d.byPaymentMethod as Record<string, number>)?.transferencia) ?? 0), 0),
    },
    topProducts: [] as Array<{ productId: string; title: string; quantity: number; revenue: number }>,
  };

  return ok(res, stats);
});

/** GET /api/coupons/admin - Todos los cupones */
router.get('/api/coupons/admin', (_req: Request, res: Response) => {
  const coupons = getCollection('coupons').find();
  return ok(res, coupons);
});

/** POST /api/coupons/admin - Crear cupón */
router.post('/api/coupons/admin', (req: Request, res: Response) => {
  const coupon = getCollection('coupons').create(req.body);
  return ok(res, coupon);
});

/** PUT /api/coupons/admin/:id - Actualizar cupón */
router.put('/api/coupons/admin/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = getCollection('coupons').findOneAndUpdate({ _id: id }, req.body, { new: true });
  if (!updated) return fail(res, 404, 'Cupón no encontrado');
  return ok(res, updated);
});

/** PUT /api/coupons/admin/:id/toggle - Toggle activo/inactivo */
router.put('/api/coupons/admin/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const coupon = getCollection('coupons').findById(id);
  if (!coupon) return fail(res, 404, 'Cupón no encontrado');
  const updated = getCollection('coupons').findOneAndUpdate({ _id: id }, { active: !coupon.active }, { new: true });
  return ok(res, updated);
});

/** DELETE /api/coupons/admin/:id - Eliminar cupón */
router.delete('/api/coupons/admin/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = getCollection('coupons').deleteOne(id);
  if (!deleted) return fail(res, 404, 'Cupón no encontrado');
  return ok(res, { deleted: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIES ADMIN
// ═══════════════════════════════════════════════════════════════════════════

/** GET /api/categories/admin - Todas las categorías */
router.get('/api/categories/admin', (_req: Request, res: Response) => {
  const categories = getCollection('categories').find();
  return ok(res, categories);
});

/** POST /api/categories/admin - Crear categoría */
router.post('/api/categories/admin', (req: Request, res: Response) => {
  const category = getCollection('categories').create(req.body);
  return ok(res, category);
});

/** PUT /api/categories/admin/:id - Actualizar categoría */
router.put('/api/categories/admin/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = getCollection('categories').findOneAndUpdate({ _id: id }, req.body, { new: true });
  if (!updated) return fail(res, 404, 'Categoría no encontrada');
  return ok(res, updated);
});

/** DELETE /api/categories/admin/:id - Eliminar categoría */
router.delete('/api/categories/admin/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = getCollection('categories').deleteOne(id);
  if (!deleted) return fail(res, 404, 'Categoría no encontrada');
  return ok(res, { deleted: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// ADDONS ADMIN
// ═══════════════════════════════════════════════════════════════════════════

/** GET /api/addons/admin - Todos los addons */
router.get('/api/addons/admin', (_req: Request, res: Response) => {
  const addons = getCollection('addons').find();
  return ok(res, addons);
});

/** POST /api/addons/admin - Crear addon */
router.post('/api/addons/admin', (req: Request, res: Response) => {
  const addon = getCollection('addons').create(req.body);
  return ok(res, addon);
});

/** PUT /api/addons/admin/:id - Actualizar addon */
router.put('/api/addons/admin/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = getCollection('addons').findOneAndUpdate({ _id: id }, req.body, { new: true });
  if (!updated) return fail(res, 404, 'Addon no encontrado');
  return ok(res, updated);
});

/** PUT /api/addons/admin/toggleActive/:id - Toggle disponibilidad */
router.put('/api/addons/admin/toggleActive/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const addon = getCollection('addons').findById(id);
  if (!addon) return fail(res, 404, 'Addon no encontrado');
  const updated = getCollection('addons').findOneAndUpdate({ _id: id }, { available: !addon.available }, { new: true });
  return ok(res, updated);
});

/** DELETE /api/addons/admin/:id - Eliminar addon */
router.delete('/api/addons/admin/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = getCollection('addons').deleteOne(id);
  if (!deleted) return fail(res, 404, 'Addon no encontrado');
  return ok(res, { deleted: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════════════════

/** POST /api/orders - Crear pedido */
router.post('/api/orders', (req: Request, res: Response) => {
  const order = getCollection('orders').create({
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    orderNumber: Date.now(),
  });
  return ok(res, order);
});

/** PUT /api/orders/admin/:id/status - Actualizar estado del pedido */
router.put('/api/orders/admin/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = getCollection('orders').findOneAndUpdate({ _id: id }, { status }, { new: true });
  if (!updated) return fail(res, 404, 'Pedido no encontrado');
  return ok(res, updated);
});

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

// Adaptadores entre el formato legacy (data.json, "days" numéricos con open/close/active)
// y el StoreConfig moderno ({schedule.days:[{day:'monday',openTime,closeTime,closed}], rain, deliveryRanges}).
const JSDOW: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
const DAY_KEYS = Object.keys(JSDOW);

function legacyToModernDays(days: unknown) {
  const raw = (Array.isArray(days) ? days : []) as Record<string, unknown>[];
  const byDow = new Map<number, Record<string, unknown>>();
  for (const d of raw) {
    const idx = Number(d.day);
    if (!byDow.has(idx)) byDow.set(idx, d);
  }
  return DAY_KEYS.map((key, i) => {
    const d = byDow.get(i);
    return {
      day: key,
      openTime: (d?.open as string) ?? '00:00',
      closeTime: (d?.close as string) ?? '23:59',
      closed: d ? !(d.active ?? true) : true,
    };
  });
}

function modernToLegacyDays(days: unknown) {
  const raw = (Array.isArray(days) ? days : []) as Record<string, unknown>[];
  return raw.map((d) => ({
    day: JSDOW[String(d.day)] ?? 0,
    open: (d.openTime as string) ?? '00:00',
    close: (d.closeTime as string) ?? '23:59',
    active: !d.closed,
  }));
}

function toStoreConfig(schedule: Record<string, unknown>) {
  const ranges = getCollection('deliveryRanges').find().map((r) => ({
    _id: r._id,
    minKm: r.minKm as number,
    maxKm: r.maxKm as number,
    cost: (r.cost ?? r.price ?? 0) as number,
  }));
  return {
    _id: schedule._id,
    isOpen: schedule.emergencyClosed ? false : true,
    emergencyClosed: schedule.emergencyClosed ?? false,
    bannerUrl: schedule.bannerUrl ?? '',
    rain: (schedule.rain as Record<string, unknown>) ?? { enabled: false, extraCost: 0 },
    schedule: {
      timezone: (schedule.timezone as string) ?? 'America/Argentina/Buenos_Aires',
      days: legacyToModernDays(schedule.days),
    },
    deliveryRanges: ranges,
  };
}

/** GET /api/config - Configuración del store */
router.get('/api/config', (_req: Request, res: Response) => {
  const schedule = getCollection('schedules').find()[0];
  if (!schedule) return ok(res, { isOpen: true, emergencyClosed: false, bannerUrl: '', rain: { enabled: false, extraCost: 0 }, schedule: { timezone: 'America/Argentina/Buenos_Aires', days: [] }, deliveryRanges: [] });
  return ok(res, toStoreConfig(schedule));
});

/** PUT /api/config/schedule - Actualizar horarios */
router.put('/api/config/schedule', (req: Request, res: Response) => {
  const schedule = getCollection('schedules').find()[0];
  if (!schedule) return fail(res, 404, 'No hay schedule configurado');
  const body = (req.body ?? {}) as Record<string, unknown>;
  const next = (body.schedule ?? body) as Record<string, unknown>;
  const updated = getCollection('schedules').findOneAndUpdate(
    { _id: schedule._id },
    {
      timezone: (next.timezone as string) ?? schedule.timezone,
      days: modernToLegacyDays(next.days),
    },
    { new: true }
  );
  return ok(res, updated ? toStoreConfig(updated) : null);
});

/** PUT /api/config/banner - Actualizar banner */
router.put('/api/config/banner', (req: Request, res: Response) => {
  const schedule = getCollection('schedules').find()[0];
  if (!schedule) return fail(res, 404, 'No hay schedule configurado');
  const updated = getCollection('schedules').findOneAndUpdate({ _id: schedule._id }, { bannerUrl: req.body.bannerUrl }, { new: true });
  return ok(res, updated ? toStoreConfig(updated) : null);
});

/** PUT /api/config/rain - Modo lluvia */
router.put('/api/config/rain', (req: Request, res: Response) => {
  const schedule = getCollection('schedules').find()[0];
  if (!schedule) return fail(res, 404, 'No hay schedule configurado');
  const body = (req.body ?? {}) as Record<string, unknown>;
  const rain = (body.rain ?? body) as Record<string, unknown>;
  const updated = getCollection('schedules').findOneAndUpdate(
    { _id: schedule._id },
    { rain: { enabled: rain.enabled ?? false, extraCost: Number(rain.extraCost ?? 0) } },
    { new: true }
  );
  return ok(res, updated ? toStoreConfig(updated) : null);
});

/** PUT /api/config/emergency - Modo emergencia */
router.put('/api/config/emergency', (req: Request, res: Response) => {
  const schedule = getCollection('schedules').find()[0];
  if (!schedule) return fail(res, 404, 'No hay schedule configurado');
  const body = (req.body ?? {}) as Record<string, unknown>;
  const closed = body.closed ?? body.emergencyClosed ?? false;
  const updated = getCollection('schedules').findOneAndUpdate(
    { _id: schedule._id },
    { emergencyClosed: closed === true },
    { new: true }
  );
  return ok(res, updated ? toStoreConfig(updated) : null);
});

/** POST /api/config/delivery-ranges - Agregar rango de delivery */
router.post('/api/config/delivery-ranges', (req: Request, res: Response) => {
  const [range] = [req.body].map((b) => {
    const cost = Number(b.cost ?? b.price ?? 0);
    return { ...b, cost, price: cost };
  });
  const created = getCollection('deliveryRanges').create(range);
  return ok(res, created);
});

/** DELETE /api/config/delivery-ranges/:id - Eliminar rango de delivery */
router.delete('/api/config/delivery-ranges/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = getCollection('deliveryRanges').deleteOne(id);
  if (!deleted) return fail(res, 404, 'Rango no encontrado');
  return ok(res, { deleted: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// GALLERY
// ═══════════════════════════════════════════════════════════════════════════

/** GET /api/gallery/images - Imágenes de galería */
router.get('/api/gallery/images', (_req: Request, res: Response) => {
  const images = getCollection('gallery').find();
  return ok(res, images);
});

/** POST /api/gallery/upload - Subir imagen (mock: solo guarda metadata) */
router.post('/api/gallery/upload', (req: Request, res: Response) => {
  const image = getCollection('gallery').create({
    url: req.body.url || 'https://via.placeholder.com/400',
    alt: req.body.alt || '',
    createdAt: new Date().toISOString(),
  });
  return ok(res, image);
});

/** DELETE /api/gallery/images/:id - Eliminar imagen */
router.delete('/api/gallery/images/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = getCollection('gallery').deleteOne(id);
  if (!deleted) return fail(res, 404, 'Imagen no encontrada');
  return ok(res, { deleted: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// GEOCODING
// ═══════════════════════════════════════════════════════════════════════════

/** POST /api/geocoding - Geocodificar dirección (mock: devuelve coordenadas fijas) */
router.post('/api/geocoding', (req: Request, res: Response) => {
  const { address } = req.body;
  return ok(res, {
    coordinates: { lat: -34.6037, lng: -58.3816 },
    formattedAddress: address || 'Buenos Aires, Argentina',
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════

/** POST /api/users/login - Login (mock: acepta cualquier credencial) */
router.post('/api/users/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const users = getCollection('users').find();
  const user = users.find((u) => (u.email as string) === email) ?? users[0];
  if (!user) return fail(res, 401, 'Credenciales inválidas');
  return ok(res, { token: 'mock-jwt-token', user: { _id: user._id, email: user.email, role: user.role } });
});

// ═══════════════════════════════════════════════════════════════════════════
// RUTA DE ESTADO DEL MOCK
// ═══════════════════════════════════════════════════════════════════════════

/** GET /api/mock/status - Estado del mock store */
router.get('/api/mock/status', (_req: Request, res: Response) => {
  return ok(res, {
    active: isMockActive(),
    message: isMockActive()
      ? 'Usando datos mock de data.json. Para usar MongoDB real, ver docs/MOCK_DATA.md'
      : 'Conectado a MongoDB real',
  });
});

export default router;
