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

describe('Categories API', () => {
  let token: string;

  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
    token = await loginAsAdmin();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('GET /api/categories/public → 200 solo activas', async () => {
    const res = await request(APP).get('/api/categories/public');
    expect(res.status).toBe(200);
    const names = res.body.data.map((c: { name: string }) => c.name);
    expect(names).toContain('Pizzas');
    expect(names).toContain('Empanadas');
    expect(names).not.toContain('Combos');
  });

  test('GET /api/categories/admin sin token → 401', async () => {
    expect((await request(APP).get('/api/categories/admin')).status).toBe(401);
  });

  test('GET /api/categories/admin → 200 todas', async () => {
    const res = await request(APP).get('/api/categories/admin').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  test('POST /api/categories/admin → 201 crea', async () => {
    const res = await request(APP)
      .post('/api/categories/admin')
      .set(auth(token))
      .send({ name: 'Bebidas', icon: 'cup-soda' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Bebidas');
  });

  test('POST nombre duplicado → 409', async () => {
    const res = await request(APP)
      .post('/api/categories/admin')
      .set(auth(token))
      .send({ name: 'Pizzas' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/ya existe|duplicado/i);
  });

  test('POST nombre vacío → 400', async () => {
    const res = await request(APP)
      .post('/api/categories/admin')
      .set(auth(token))
      .send({ name: '' });
    expect(res.status).toBe(400);
  });

  test('PUT /api/categories/admin/:id → 200 actualiza', async () => {
    const res = await request(APP)
      .put(`/api/categories/admin/${IDS.categoryPizzas}`)
      .set(auth(token))
      .send({ icon: 'pizza' });
    expect(res.status).toBe(200);
    expect(res.body.data.icon).toBe('pizza');
  });

  test('PUT id inexistente → 404', async () => {
    const res = await request(APP)
      .put(`/api/categories/admin/${objectIdStr()}`)
      .set(auth(token))
      .send({ icon: 'x' });
    expect(res.status).toBe(404);
  });

  test('DELETE categoría con productos → 409', async () => {
    const res = await request(APP)
      .delete(`/api/categories/admin/${IDS.categoryPizzas}`)
      .set(auth(token));
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/producto/i);
  });

  test('DELETE categoría sin productos → 200', async () => {
    const create = await request(APP)
      .post('/api/categories/admin')
      .set(auth(token))
      .send({ name: `Cat a borrar ${Date.now()}` });
    const id = create.body.data._id;
    const res = await request(APP).delete(`/api/categories/admin/${id}`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  test('DELETE id inexistente → 404', async () => {
    const res = await request(APP).delete(`/api/categories/admin/${objectIdStr()}`).set(auth(token));
    expect(res.status).toBe(404);
  });
});