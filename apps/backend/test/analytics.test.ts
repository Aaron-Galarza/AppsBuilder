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

const baseOrder = {
  source: 'web',
  customer: { name: 'Nico Prueba', phone: '1155550000' },
  items: [{ productId: IDS.productMuzzarella, quantity: 1, addons: [] }],
  deliveryType: 'pickup',
  paymentMethod: 'cash',
};

async function crearYEntregar(order: Partial<typeof baseOrder>, token: string) {
  const create = await request(APP).post('/api/orders').send({ ...baseOrder, ...order });
  expect(create.status).toBe(201);

  // Recorrer la cadena de transiciones real: pending→confirmed→preparing→ready→delivered
  for (const status of ['confirmed', 'preparing', 'ready', 'delivered']) {
    const res = await request(APP)
      .put(`/api/orders/admin/${create.body.data._id}/status`)
      .set(auth(token))
      .send({ status });
    expect(res.status).toBe(200);
  }
}

describe('GET /api/analytics', () => {
  let token: string;

  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
    token = await loginAsAdmin();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('sin token → 401', async () => {
    const res = await request(APP).get('/api/analytics?range=hoy');
    expect(res.status).toBe(401);
  });

  test('base de datos vacía → 200 con estadísticas en cero', async () => {
    const res = await request(APP).get('/api/analytics?range=hoy').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalOrders).toBe(0);
    expect(res.body.data.totalRevenue).toBe(0);
    expect(res.body.data.delivered).toBe(0);
    expect(res.body.data.byPaymentMethod).toEqual({
      cash: 0,
      debito: 0,
      credito: 0,
      transferencia: 0,
    });
    expect(res.body.data.topProducts).toEqual([]);
    expect(res.body.data.range.from).toBeTruthy();
    expect(res.body.data.range.to).toBeTruthy();
  });

  test('after 1 delivered (cash) → cuenta orden, entrega y revenue', async () => {
    await crearYEntregar({}, token);

    const res = await request(APP).get('/api/analytics?range=hoy').set(auth(token));
    expect(res.body.data.totalOrders).toBe(1);
    expect(res.body.data.delivered).toBe(1);
    expect(res.body.data.totalRevenue).toBe(10500);
    expect(res.body.data.byPaymentMethod.cash).toBe(10500);
    expect(res.body.data.byPaymentMethod.credito).toBe(0);

    const muzzarella = res.body.data.topProducts.find(
      (t: { productId: string }) => t.productId === IDS.productMuzzarella
    );
    expect(muzzarella).toMatchObject({ quantity: 1, revenue: 10500 });
  });

  test('segundo pedido credito entregado → suma métricas', async () => {
    await crearYEntregar({ paymentMethod: 'credito' }, token);

    const res = await request(APP).get('/api/analytics?range=hoy').set(auth(token));
    expect(res.body.data.totalOrders).toBe(2);
    expect(res.body.data.delivered).toBe(2);
    expect(res.body.data.totalRevenue).toBe(10500 + Math.round(10500 * 1.15));
    expect(res.body.data.byPaymentMethod.credito).toBe(Math.round(10500 * 1.15));
  });

  test('range=mes → incluye los pedidos de hoy', async () => {
    const res = await request(APP).get('/api/analytics?range=mes').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.totalOrders).toBe(2);
    expect(res.body.data.delivered).toBe(2);
  });

  test('range=ayer → no cuenta pedidos de hoy (si no es el mismo día)', async () => {
    const res = await request(APP).get('/api/analytics?range=ayer').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.totalOrders).toBe(0);
  });

  test('range inválido → cae a hoy sin romper', async () => {
    const res = await request(APP).get('/api/analytics?range=futuro').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.totalOrders).toBe(2); // mismo cálculo que 'hoy'
  });

  test('pedido cancelado después de entregado revierte métricas (delivered→cancelled)', async () => {
    const create = await request(APP).post('/api/orders').send(baseOrder);
    const id = create.body.data._id;

    for (const status of ['confirmed', 'preparing', 'ready', 'delivered']) {
      await request(APP)
        .put(`/api/orders/admin/${id}/status`)
        .set(auth(token))
        .send({ status });
    }

    const before = await request(APP).get('/api/analytics?range=hoy').set(auth(token));
    expect(before.body.data.totalOrders).toBe(3);
    expect(before.body.data.delivered).toBe(3);

    await request(APP)
      .put(`/api/orders/admin/${id}/status`)
      .set(auth(token))
      .send({ status: 'cancelled' });

    const after = await request(APP).get('/api/analytics?range=hoy').set(auth(token));
    expect(after.body.data.totalOrders).toBe(3); // el pedido sigue contado como orden
    expect(after.body.data.delivered).toBe(2); // pero ya no cuenta como entregado
    expect(after.body.data.totalRevenue).toBe(10500 + Math.round(10500 * 1.15));
  });
});