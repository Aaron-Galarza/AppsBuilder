import request from 'supertest';
import {
  connectTestDb,
  disconnectTestDb,
  resetDb,
  loginAsAdmin,
  APP,
  auth,
  IDS,
  objectIdStr,
} from './bootstrap';

describe('Addons API', () => {
  let token: string;

  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
    token = await loginAsAdmin();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('GET /api/addons/public → 200 todos (disponibles)', async () => {
    const res = await request(APP).get('/api/addons/public');
    expect(res.status).toBe(200);
    const names = res.body.data.map((a: { name: string }) => a.name);
    expect(names).toContain('Extra Muzzarella');
    expect(names).toContain('Salsa Picante');
  });

  test('GET /api/addons/admin sin token → 401', async () => {
    expect((await request(APP).get('/api/addons/admin')).status).toBe(401);
  });

  test('GET /api/addons/admin → 200', async () => {
    const res = await request(APP).get('/api/addons/admin').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  test('POST /api/addons/admin → 201 crea', async () => {
    const res = await request(APP)
      .post('/api/addons/admin')
      .set(auth(token))
      .send({ name: 'Bacon', price: 1200 });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Bacon', price: 1200, available: true });
  });

  test('POST /api/addons/admin sin nombre → 400', async () => {
    const res = await request(APP)
      .post('/api/addons/admin')
      .set(auth(token))
      .send({ price: 500 });
    expect(res.status).toBe(400);
  });

  test('POST /api/addons/admin precio negativo → 400', async () => {
    const res = await request(APP)
      .post('/api/addons/admin')
      .set(auth(token))
      .send({ name: 'X', price: -1 });
    expect(res.status).toBe(400);
  });

  test('PUT /api/addons/admin/:id → 200 actualiza', async () => {
    const res = await request(APP)
      .put(`/api/addons/admin/${IDS.addonMuzzarella}`)
      .set(auth(token))
      .send({ price: 900 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(900);
  });

  test('PUT id inexistente → 404', async () => {
    const res = await request(APP)
      .put(`/api/addons/admin/${objectIdStr()}`)
      .set(auth(token))
      .send({ price: 1 });
    expect(res.status).toBe(404);
  });

  test('PUT /api/addons/admin/toggleActive/:id invierte available', async () => {
    const res = await request(APP)
      .put(`/api/addons/admin/toggleActive/${IDS.addonPicante}`)
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(false);

    const pub = await request(APP).get('/api/addons/public');
    const names = pub.body.data.map((a: { name: string }) => a.name);
    expect(names).not.toContain('Salsa Picante');
  });

  test('DELETE addon → 200, ya no aparece y se desreferencia de productos', async () => {
    const res = await request(APP)
      .delete(`/api/addons/admin/${IDS.addonPicante}`)
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(IDS.addonPicante);

    const products = await request(APP).get('/api/products/admin').set(auth(token));
    const pizza = products.body.data.find((p: { _id: string }) => p._id === IDS.productMuzzarella);
    expect(pizza.addons.map(String)).not.toContain(IDS.addonPicante);
  });

  test('DELETE id inexistente → 200 (idempotente, no lanza 404)', async () => {
    const res = await request(APP).delete(`/api/addons/admin/${objectIdStr()}`).set(auth(token));
    expect(res.status).toBe(200);
  });
});