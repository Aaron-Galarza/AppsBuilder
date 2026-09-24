import request from 'supertest';
import { StoreConfig } from '../src/modules/schedules/model';
import { connectTestDb, disconnectTestDb, resetDb, APP } from './bootstrap';

const STORE = { lat: -34.6037, lng: -58.3816 };

describe('POST /api/delivery/calculate', () => {
  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('coordenadas del local (0 km) → cae en el rango 0-2 → 300', async () => {
    const res = await request(APP).post('/api/delivery/calculate').send(STORE);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deliveryCost).toBe(300);
    expect(res.body.data.distanceKm).toBeGreaterThanOrEqual(0);
    expect(res.body.data.details).toMatch(/km/);
    expect(res.body.data.rainSurcharge).toBe(0);
  });

  test('coordenada muy lejana → usa el último rango configurado (1200)', async () => {
    const res = await request(APP)
      .post('/api/delivery/calculate')
      .send({ lat: -31.4167, lng: -64.1833 }); // Córdoba ~ 700 km en línea recta
    expect(res.status).toBe(200);
    expect(res.body.data.deliveryCost).toBe(1200);
  });

  test('con recargo por lluvia activo → suma extraCost', async () => {
    const config = await StoreConfig.getOrCreateConfig();
    config.rain = { enabled: true, extraCost: 200 };
    await config.save();

    const res = await request(APP).post('/api/delivery/calculate').send(STORE);
    expect(res.status).toBe(200);
    expect(res.body.data.rainSurcharge).toBe(200);
    expect(res.body.data.deliveryCost).toBe(500);
    expect(res.body.data.details).toContain('+lluvia');

    config.rain = { enabled: false, extraCost: 0 };
    await config.save();
  });

  test('lat fuera de rango (91) → 400', async () => {
    const res = await request(APP).post('/api/delivery/calculate').send({ lat: 91, lng: -58.38 });
    expect(res.status).toBe(400);
  });

  test('sin lng → 400', async () => {
    const res = await request(APP).post('/api/delivery/calculate').send({ lat: -34.6 });
    expect(res.status).toBe(400);
  });

  test('sin body → 400', async () => {
    const res = await request(APP).post('/api/delivery/calculate').send({});
    expect(res.status).toBe(400);
  });
});