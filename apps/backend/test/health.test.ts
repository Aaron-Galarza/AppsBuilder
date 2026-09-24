import request from 'supertest';
import { connectTestDb, disconnectTestDb, resetDb, APP } from './bootstrap';

describe('Health y rutas base', () => {
  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('GET / → 200 con envelope y db up', async () => {
    const res = await request(APP).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/API funcionando/);
    expect(res.body.data.db).toBe('up');
  });

  test('GET /api/health → 200 {status, db, timestamp}', async () => {
    const res = await request(APP).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.db).toBe('up');
    expect(new Date(res.body.data.timestamp).toISOString()).toBe(res.body.data.timestamp);
  });

  test('Ruta desconocida → 404 {success:false}', async () => {
    const res = await request(APP).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Ruta no encontrada');
  });
});