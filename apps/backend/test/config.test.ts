import http from 'http';
import request from 'supertest';
import { initSocket } from '../src/socket/socket';
import {
  connectTestDb,
  disconnectTestDb,
  resetDb,
  loginAsAdmin,
  APP,
  auth,
  DAY_KEYS,
} from './bootstrap';

const server = http.createServer(APP);
server.listen(0);
initSocket(server);

const allDaySchedule = {
  timezone: 'America/Argentina/Buenos_Aires',
  days: DAY_KEYS.map((day) => ({ day, openTime: '00:00', closeTime: '23:59', closed: false })),
};

describe('Config API (/api/config)', () => {
  let token: string;

  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
    token = await loginAsAdmin();
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectTestDb();
  });

  test('GET /api/config/status → 200 público con local abierto (fixture all-day)', async () => {
    const res = await request(APP).get('/api/config/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isOpen).toBe(true);
    expect(res.body.data.emergencyClosed).toBe(false);
    expect(typeof res.body.data.bannerUrl).toBe('string');
  });

  test('GET /api/config sin token → 401', async () => {
    expect((await request(APP).get('/api/config')).status).toBe(401);
  });

  test('GET /api/config → 200 con config completa (rangos de delivery seed)', async () => {
    const res = await request(APP).get('/api/config').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.deliveryRanges).toHaveLength(4);
    expect(res.body.data.schedule.days).toHaveLength(7);
    expect(res.body.data.emergencyClosed).toBe(false);
  });

  test('PUT /api/config/emergency {closed:true} → cierra el local y emite socket', async () => {
    const res = await request(APP)
      .put('/api/config/emergency')
      .set(auth(token))
      .send({ closed: true });
    expect(res.status).toBe(200);
    expect(res.body.data.emergencyClosed).toBe(true);

    const status = await request(APP).get('/api/config/status');
    expect(status.body.data.isOpen).toBe(false);
    expect(status.body.data.emergencyClosed).toBe(true);
  });

  test('PUT /api/config/emergency {closed:false} → vuelve a abrir', async () => {
    const res = await request(APP)
      .put('/api/config/emergency')
      .set(auth(token))
      .send({ closed: false });
    expect(res.status).toBe(200);
    expect(res.body.data.emergencyClosed).toBe(false);

    const status = await request(APP).get('/api/config/status');
    expect(status.body.data.isOpen).toBe(true);
  });

  test('PUT emergency con body inválido → 400', async () => {
    const res = await request(APP)
      .put('/api/config/emergency')
      .set(auth(token))
      .send({ closed: 'si' });
    expect(res.status).toBe(400);
  });

  test('PUT /api/config/schedule → 200 y persiste', async () => {
    const schedule = {
      ...allDaySchedule,
      days: DAY_KEYS.map((day, i) => ({
        day,
        openTime: '09:00',
        closeTime: '18:00',
        closed: i === 0, // el primer día (lunes) cierra
      })),
    };
    const res = await request(APP)
      .put('/api/config/schedule')
      .set(auth(token))
      .send({ schedule });
    expect(res.status).toBe(200);
    expect(res.body.data.schedule.days).toHaveLength(7);

    const config = await request(APP).get('/api/config').set(auth(token));
    expect(config.body.data.schedule.days[0].closed).toBe(true);
    expect(config.body.data.schedule.days[0].openTime).toBe('09:00');
  });

  test('PUT schedule con menos de 7 días → 400', async () => {
    const res = await request(APP)
      .put('/api/config/schedule')
      .set(auth(token))
      .send({ schedule: { timezone: 'x', days: allDaySchedule.days.slice(0, 3) } });
    expect(res.status).toBe(400);
  });

  test('PUT /api/config/banner → 200 y se refleja en status público', async () => {
    const res = await request(APP)
      .put('/api/config/banner')
      .set(auth(token))
      .send({ bannerUrl: 'https://example.com/banner.png' });
    expect(res.status).toBe(200);
    expect(res.body.data.bannerUrl).toBe('https://example.com/banner.png');

    const status = await request(APP).get('/api/config/status');
    expect(status.body.data.bannerUrl).toBe('https://example.com/banner.png');
  });

  test('PUT /api/config/rain → 200 habilita recargo', async () => {
    const res = await request(APP)
      .put('/api/config/rain')
      .set(auth(token))
      .send({ rain: { enabled: true, extraCost: 250 } });
    expect(res.status).toBe(200);
    expect(res.body.data.rain).toMatchObject({ enabled: true, extraCost: 250 });
  });

  test('PUT rain con extraCost negativo → 400', async () => {
    const res = await request(APP)
      .put('/api/config/rain')
      .set(auth(token))
      .send({ rain: { enabled: true, extraCost: -5 } });
    expect(res.status).toBe(400);
  });

  test('POST /api/config/delivery-ranges → 201 agrega rango', async () => {
    const res = await request(APP)
      .post('/api/config/delivery-ranges')
      .set(auth(token))
      .send({ minKm: 12.01, maxKm: 15, cost: 2500 });
    expect(res.status).toBe(201);
    expect(res.body.data.deliveryRanges).toHaveLength(5);
  });

  test('POST range inválido (negativo) → 400', async () => {
    const res = await request(APP)
      .post('/api/config/delivery-ranges')
      .set(auth(token))
      .send({ minKm: -1, maxKm: 5, cost: 100 });
    expect(res.status).toBe(400);
  });

  test('DELETE /api/config/delivery-ranges/:id → 200 elimina', async () => {
    const config = await request(APP).get('/api/config').set(auth(token));
    const added = config.body.data.deliveryRanges.find((r: { minKm: number }) => r.minKm === 12.01);

    const del = await request(APP)
      .delete(`/api/config/delivery-ranges/${added._id}`)
      .set(auth(token));
    expect(del.status).toBe(200);
    expect(del.body.data.deliveryRanges).toHaveLength(4);
  });

  test('DELETE rango inexistente → 404', async () => {
    const res = await request(APP)
      .delete('/api/config/delivery-ranges/c10000000000000000000055')
      .set(auth(token));
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/rango/i);
  });
});