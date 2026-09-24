import request from 'supertest';
import { connectTestDb, disconnectTestDb, resetDb, APP } from './bootstrap';

describe('POST /api/geocoding', () => {
  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('forward: query válida → 200 con [] (sin MAPBOX_TOKEN en tests)', async () => {
    const res = await request(APP).post('/api/geocoding').send({ query: 'Corrientes 1234' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  test('query muy corta (< 3) → 400', async () => {
    const res = await request(APP).post('/api/geocoding').send({ query: 'ab' });
    expect(res.status).toBe(400);
  });

  test('reverse: lat+lng → 200 con [] (sin token)', async () => {
    const res = await request(APP).post('/api/geocoding').send({ lat: -34.6037, lng: -58.3816 });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('sin query ni lat/lng → 400', async () => {
    const res = await request(APP).post('/api/geocoding').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/query|lat/i);
  });

  test('lat fuera de rango → 400', async () => {
    const res = await request(APP).post('/api/geocoding').send({ lat: -120, lng: 0 });
    expect(res.status).toBe(400);
  });

  test('Método GET no soportado → 404', async () => {
    const res = await request(APP).get('/api/geocoding');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});