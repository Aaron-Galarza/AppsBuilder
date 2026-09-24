import request from 'supertest';
import {
  connectTestDb,
  disconnectTestDb,
  resetDb,
  loginAsAdmin,
  APP,
  auth,
  IDS,
} from './bootstrap';

const STORE_COORDS = { lat: -34.6037, lng: -58.3816 };

const baseOrder = {
  source: 'web',
  customer: { name: 'Nico Prueba', phone: '1155550000' },
  items: [{ productId: IDS.productMuzzarella, quantity: 1, addons: [] }],
  deliveryType: 'pickup',
  paymentMethod: 'cash',
};

const ORDER_NUMBER_RE = /^\d{8}-\d{3}$/;

describe('POST /api/orders — creación (web y manual)', () => {
  let token: string;

  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
    token = await loginAsAdmin();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('pedido pickup válido (web) → 201 con total correcto', async () => {
    const res = await request(APP).post('/api/orders').send(baseOrder);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toMatch(ORDER_NUMBER_RE);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.deliveryType).toBe('pickup');
    expect(res.body.data.paymentMethod).toBe('cash');
    expect(res.body.data.subtotal).toBe(10500);
    expect(res.body.data.discount).toBe(0);
    expect(res.body.data.deliveryCost).toBe(0);
    expect(res.body.data.surcharge).toBe(0);
    expect(res.body.data.total).toBe(10500);
  });

  test('web con cupón porcentual → descuenta 10%', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({ ...baseOrder, couponCode: 'BIENVENIDO' });
    expect(res.status).toBe(201);
    expect(res.body.data.discount).toBe(1050);
    expect(res.body.data.total).toBe(9450);
  });

  test('web con cupón fijo + efectivo → descuenta 500', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({ ...baseOrder, couponCode: 'FIJO500' });
    expect(res.status).toBe(201);
    expect(res.body.data.discount).toBe(500);
    expect(res.body.data.total).toBe(10000);
  });

  test('cupón que no aplica al método de pago → 409', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({ ...baseOrder, paymentMethod: 'credito', couponCode: 'FIJO500' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/método de pago/i);
  });

  test('cupón inactivo → 409', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({ ...baseOrder, couponCode: 'VENCIDO' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/activo/i);
  });

  test('cupón inexistente → 404', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({ ...baseOrder, couponCode: 'NOEXISTE' });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no existe/i);
  });

  test('múltiples cantidades y cupón → total escala', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({
        ...baseOrder,
        items: [{ productId: IDS.productMuzzarella, quantity: 2, addons: [] }],
        couponCode: 'BIENVENIDO',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.subtotal).toBe(21000);
    expect(res.body.data.discount).toBe(2100);
    expect(res.body.data.total).toBe(18900);
  });

  test('crédito → recargo 15%', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({ ...baseOrder, paymentMethod: 'credito' });
    expect(res.status).toBe(201);
    expect(res.body.data.surcharge).toBe(Math.round(10500 * 0.15));
    expect(res.body.data.total).toBe(10500 + Math.round(10500 * 0.15));
  });

  test('con adicionales referenciados → suma al item', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({
        ...baseOrder,
        items: [
          {
            productId: IDS.productMuzzarella,
            quantity: 1,
            addons: [
              { addonId: IDS.addonMuzzarella, quantity: 1 },
              { addonId: IDS.addonPicante, quantity: 1 },
            ],
          },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.subtotal).toBe(11300);
    expect(res.body.data.total).toBe(11300);
  });

  test('adicional no perteneciente al producto → 409', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({
        ...baseOrder,
        items: [
          {
            productId: IDS.productMuzzarella,
            quantity: 1,
            addons: [{ addonId: IDS.addonCheddar, quantity: 1 }],
          },
        ],
      });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/adicional/i);
  });

  test('producto no disponible → 409', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({
        ...baseOrder,
        items: [{ productId: 'c10000000000000000000099', quantity: 1, addons: [] }],
      });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/no está disponible/i);
  });

  test('producto inexistente → 404', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({
        ...baseOrder,
        items: [{ productId: 'c10000000000000000000055', quantity: 1, addons: [] }],
      });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/Producto no encontrado/);
  });

  test('delivery web sin coordenadas → 422', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({
        ...baseOrder,
        deliveryType: 'delivery',
        delivery: { address: 'Av. Corrientes 1234' },
      });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/ubicar/i);
  });

  test('delivery web sin dirección → 400', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({ ...baseOrder, deliveryType: 'delivery' });
    expect(res.status).toBe(400);
  });

  test('delivery web con coordenadas → acredita costo de rango', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({
        ...baseOrder,
        deliveryType: 'delivery',
        delivery: { address: 'Av. Corrientes 1234', ...STORE_COORDS },
      });
    expect(res.status).toBe(201);
    expect(res.body.data.deliveryCost).toBe(300);
    expect(res.body.data.total).toBe(10800);
  });

  test('manual sin coordenadas → deliveryCost 0, source manual', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({
        source: 'manual',
        customer: { name: 'Pedido Telefónico', phone: '43000000' },
        items: [{ productId: IDS.productMuzzarella, quantity: 1, addons: [] }],
        deliveryType: 'delivery',
        delivery: { address: 'Sin coord, lo carga el local' },
        paymentMethod: 'cash',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.deliveryCost).toBe(0);
    expect(res.body.data.total).toBe(10500);
  });

  test('items vacíos → 400', async () => {
    const res = await request(APP).post('/api/orders').send({ ...baseOrder, items: [] });
    expect(res.status).toBe(400);
  });

  test('customer nombre corto → 400', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({ ...baseOrder, customer: { name: 'Ni', phone: '1155550000' } });
    expect(res.status).toBe(400);
  });

  test('método de pago inválido → 400', async () => {
    const res = await request(APP)
      .post('/api/orders')
      .send({ ...baseOrder, paymentMethod: 'bitcoin' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/orders/admin y PUT .../status', () => {
  let token: string;
  let orderId: string;

  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
    token = await loginAsAdmin();

    const create = await request(APP).post('/api/orders').send(baseOrder);
    orderId = create.body.data._id;
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('GET /api/orders/admin sin token → 401', async () => {
    expect((await request(APP).get('/api/orders/admin')).status).toBe(401);
  });

  test('GET /api/orders/admin?range=hoy → incluye el pedido', async () => {
    const res = await request(APP).get('/api/orders/admin?range=hoy').set(auth(token));
    expect(res.status).toBe(200);
    const ids = res.body.data.map((o: { _id: string }) => o._id);
    expect(ids).toContain(orderId);
  });

  test('GET /api/orders/admin con range inválido → vuelve a hoy (no rompe)', async () => {
    const res = await request(APP).get('/api/orders/admin?range=anio').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('header de auth correcto', async () => {
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(50);
  });

  test('PUT status sin token → 401', async () => {
    expect(
      (await request(APP).put(`/api/orders/admin/${orderId}/status`).send({ status: 'confirmed' }))
        .status
    ).toBe(401);
  });

  test('transición válida pending→confirmed → 200', async () => {
    const res = await request(APP)
      .put(`/api/orders/admin/${orderId}/status`)
      .set(auth(token))
      .send({ status: 'confirmed' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('confirmed');
  });

  test('transición inválida confirmed→ready → 409', async () => {
    const res = await request(APP)
      .put(`/api/orders/admin/${orderId}/status`)
      .set(auth(token))
      .send({ status: 'ready' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/no se puede pasar/i);
  });

  test('flujo completo hasta delivered → 200', async () => {
    const flow = ['preparing', 'ready', 'delivered'];
    for (const status of flow) {
      const res = await request(APP)
        .put(`/api/orders/admin/${orderId}/status`)
        .set(auth(token))
        .send({ status });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(status);
    }
  });

  test('delivered→cancelled revierte (permite cancelar) → 200', async () => {
    const res = await request(APP)
      .put(`/api/orders/admin/${orderId}/status`)
      .set(auth(token))
      .send({ status: 'cancelled' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
  });

  test('desde cancelled no se puede volver → 409', async () => {
    const res = await request(APP)
      .put(`/api/orders/admin/${orderId}/status`)
      .set(auth(token))
      .send({ status: 'confirmed' });
    expect(res.status).toBe(409);
  });

  test('status inválido → 400', async () => {
    const res = await request(APP)
      .put(`/api/orders/admin/${orderId}/status`)
      .set(auth(token))
      .send({ status: 'finalizado' });
    expect(res.status).toBe(400);
  });

  test('pedido inexistente → 404', async () => {
    const res = await request(APP)
      .put('/api/orders/admin/c10000000000000000000055/status')
      .set(auth(token))
      .send({ status: 'confirmed' });
    expect(res.status).toBe(404);
  });
});