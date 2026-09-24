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

describe('Products API', () => {
  let token: string;

  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
    token = await loginAsAdmin();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('GET /api/products/public → 200 solo disponibles', async () => {
    const res = await request(APP).get('/api/products/public');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const titles = res.body.data.map((p: { title: string }) => p.title);
    expect(titles).toContain('Pizza Muzzarella');
    expect(titles).toContain('Pizza de Rúcula');
    expect(titles).not.toContain('Producto No Disponible');
  });

  test('GET /api/products/admin sin token → 401', async () => {
    const res = await request(APP).get('/api/products/admin');
    expect(res.status).toBe(401);
  });

  test('GET /api/products/admin con token → 200 todos', async () => {
    const res = await request(APP).get('/api/products/admin').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  test('POST /api/products/admin → 201 crea', async () => {
    const res = await request(APP)
      .post('/api/products/admin')
      .set(auth(token))
      .send({ title: 'Pizza Ananá', price: 12000, category: IDS.categoryPizzas });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      title: 'Pizza Ananá',
      price: 12000,
      available: true,
    });
    expect(res.body.data._id).toEqual(expect.any(String));
  });

  test('POST /api/products/admin sin token → 401', async () => {
    const res = await request(APP)
      .post('/api/products/admin')
      .send({ title: 'X', price: 1, category: IDS.categoryPizzas });
    expect(res.status).toBe(401);
  });

  test('POST inválido (sin título) → 400', async () => {
    const res = await request(APP)
      .post('/api/products/admin')
      .set(auth(token))
      .send({ price: 100, category: IDS.categoryPizzas });
    expect(res.status).toBe(400);
  });

  test('POST precio negativo → 400', async () => {
    const res = await request(APP)
      .post('/api/products/admin')
      .set(auth(token))
      .send({ title: 'X', price: -10, category: IDS.categoryPizzas });
    expect(res.status).toBe(400);
  });

  test('PUT /api/products/admin/:id → 200 actualiza', async () => {
    const res = await request(APP)
      .put(`/api/products/admin/${IDS.productMuzzarella}`)
      .set(auth(token))
      .send({ price: 10900 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(10900);
  });

  test('PUT id inexistente → 404', async () => {
    const res = await request(APP)
      .put(`/api/products/admin/${objectIdStr()}`)
      .set(auth(token))
      .send({ price: 1 });
    expect(res.status).toBe(404);
  });

  test('PUT body inválido (precio negativo) → 400', async () => {
    const res = await request(APP)
      .put(`/api/products/admin/${IDS.productMuzzarella}`)
      .set(auth(token))
      .send({ price: -5 });
    expect(res.status).toBe(400);
  });

  test('PUT /api/products/admin/toggleActive/:id invierte available', async () => {
    const before = await request(APP).get('/api/products/admin').set(auth(token));
    const product = before.body.data.find((p: { _id: string }) => p._id === IDS.productMuzzarella);
    const res = await request(APP)
      .put(`/api/products/admin/toggleActive/${IDS.productMuzzarella}`)
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(!product.available);
  });

  test('PUT toggleActive id inexistente → 404', async () => {
    const res = await request(APP)
      .put(`/api/products/admin/toggleActive/${objectIdStr()}`)
      .set(auth(token));
    expect(res.status).toBe(404);
  });

  test('DELETE /api/products/admin/:id → 200 y desaparece del listado', async () => {
    const create = await request(APP)
      .post('/api/products/admin')
      .set(auth(token))
      .send({ title: 'Temp a borrar', price: 1, category: IDS.categoryPizzas });
    const id = create.body.data._id;

    const del = await request(APP).delete(`/api/products/admin/${id}`).set(auth(token));
    expect(del.status).toBe(200);
    expect(del.body.data.id).toBe(id);

    const list = await request(APP).get('/api/products/admin').set(auth(token));
    expect(list.body.data.some((p: { _id: string }) => p._id === id)).toBe(false);
  });

  test('DELETE id inexistente → 404', async () => {
    const res = await request(APP).delete(`/api/products/admin/${objectIdStr()}`).set(auth(token));
    expect(res.status).toBe(404);
  });
});