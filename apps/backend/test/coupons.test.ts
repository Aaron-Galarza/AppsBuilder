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

describe('POST /api/coupons/validate/:code — público', () => {
  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('cupón porcentual válido → 200 con discountAmount', async () => {
    const res = await request(APP)
      .post('/api/coupons/validate/BIENVENIDO')
      .send({ subtotal: 10000, paymentMethod: 'cash' });
    expect(res.status).toBe(200);
    expect(res.body.data.code).toBe('BIENVENIDO');
    expect(res.body.data.discountAmount).toBe(1000);
  });

  test('cupón fijo válido → 200 con descuento fijo', async () => {
    const res = await request(APP)
      .post('/api/coupons/validate/FIJO500')
      .send({ subtotal: 10000, paymentMethod: 'debito' });
    expect(res.status).toBe(200);
    expect(res.body.data.discountAmount).toBe(500);
  });

  test('cupón fijo con método no válido → 409', async () => {
    const res = await request(APP)
      .post('/api/coupons/validate/FIJO500')
      .send({ subtotal: 10000, paymentMethod: 'credito' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/método de pago/i);
  });

  test('sin método de pago + cupón con restricciones → 409', async () => {
    const res = await request(APP)
      .post('/api/coupons/validate/BIENVENIDO')
      .send({ subtotal: 5000 });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/método de pago/i);
  });

  test('subtotal menor al cupón fijo → 409', async () => {
    const res = await request(APP)
      .post('/api/coupons/validate/FIJO500')
      .send({ subtotal: 100, paymentMethod: 'cash' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/subtotal/i);
  });

  test('cupón inactivo → 409', async () => {
    const res = await request(APP)
      .post('/api/coupons/validate/VENCIDO')
      .send({ subtotal: 10000, paymentMethod: 'cash' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/no está activo/i);
  });

  test('cupón inexistente → 404', async () => {
    const res = await request(APP)
      .post('/api/coupons/validate/NOEXISTE')
      .send({ subtotal: 10000, paymentMethod: 'cash' });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no existe/i);
  });

  test('código en minúsculas → lo normaliza a mayúsculas', async () => {
    const res = await request(APP)
      .post('/api/coupons/validate/bienvenido')
      .send({ subtotal: 10000, paymentMethod: 'cash' });
    expect(res.status).toBe(200);
    expect(res.body.data.code).toBe('BIENVENIDO');
  });
});

describe('Coupons admin (CRUD + toggle)', () => {
  let token: string;

  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
    token = await loginAsAdmin();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('GET /api/coupons/admin sin token → 401', async () => {
    expect((await request(APP).get('/api/coupons/admin')).status).toBe(401);
  });

  test('GET /api/coupons/admin → 200 con los 3 seed', async () => {
    const res = await request(APP).get('/api/coupons/admin').set(auth(token));
    expect(res.status).toBe(200);
    const codes = res.body.data.map((c: { code: string }) => c.code);
    expect(codes).toEqual(expect.arrayContaining(['BIENVENIDO', 'FIJO500', 'VENCIDO']));
  });

  test('POST /api/coupons/admin → 201, código se guarda en mayúsculas', async () => {
    const res = await request(APP)
      .post('/api/coupons/admin')
      .set(auth(token))
      .send({ code: 'nuevo10', discountType: 'percentage', discountValue: 10 });
    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('NUEVO10');
    expect(res.body.data.active).toBe(true);
  });

  test('POST código duplicado (case-insensitive) → 409', async () => {
    const res = await request(APP)
      .post('/api/coupons/admin')
      .set(auth(token))
      .send({ code: 'NUEVO10', discountType: 'percentage', discountValue: 15 });
    expect(res.status).toBe(409);
  });

  test('POST código con caracteres inválidos → 400', async () => {
    const res = await request(APP)
      .post('/api/coupons/admin')
      .set(auth(token))
      .send({ code: 'NUEVO 10!', discountType: 'fixed', discountValue: 100 });
    expect(res.status).toBe(400);
  });

  test('POST discountValue <= 0 → 400', async () => {
    const res = await request(APP)
      .post('/api/coupons/admin')
      .set(auth(token))
      .send({ code: 'CERO', discountType: 'fixed', discountValue: 0 });
    expect(res.status).toBe(400);
  });

  test('PUT /api/coupons/admin/:id → 200 actualiza', async () => {
    const res = await request(APP)
      .put(`/api/coupons/admin/${IDS.couponFijo500}`)
      .set(auth(token))
      .send({ discountValue: 750 });
    expect(res.status).toBe(200);
    expect(res.body.data.discountValue).toBe(750);
  });

  test('PUT id inexistente → 404', async () => {
    const res = await request(APP)
      .put('/api/coupons/admin/c10000000000000000000055')
      .set(auth(token))
      .send({ discountValue: 10 });
    expect(res.status).toBe(404);
  });

  test('PUT /:id/toggle invierte active', async () => {
    const res = await request(APP)
      .put(`/api/coupons/admin/${IDS.couponBienvenido}/toggle`)
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.active).toBe(false);
  });

  test('PUT toggle id inexistente → 404', async () => {
    const res = await request(APP)
      .put('/api/coupons/admin/c10000000000000000000055/toggle')
      .set(auth(token));
    expect(res.status).toBe(404);
  });

  test('DELETE /api/coupons/admin/:id → 200 y desaparece', async () => {
    const res = await request(APP)
      .delete(`/api/coupons/admin/${IDS.couponVencido}`)
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(IDS.couponVencido);

    const list = await request(APP).get('/api/coupons/admin').set(auth(token));
    const codes = list.body.data.map((c: { code: string }) => c.code);
    expect(codes).not.toContain('VENCIDO');
  });

  test('DELETE id inexistente → 404', async () => {
    const res = await request(APP)
      .delete('/api/coupons/admin/c10000000000000000000055')
      .set(auth(token));
    expect(res.status).toBe(404);
  });
});