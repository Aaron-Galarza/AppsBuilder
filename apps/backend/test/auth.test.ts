import request from 'supertest';
import { connectTestDb, disconnectTestDb, resetDb, loginAsAdmin, APP, auth } from './bootstrap';

describe('POST /api/users/login', () => {
  let token: string;

  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
    token = await loginAsAdmin();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('credenciales válidas → 200 con token y user', async () => {
    const res = await request(APP).post('/api/users/login').send({
      email: 'admin@local.dev',
      password: 'admin123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({ email: 'admin@local.dev', role: 'admin' });
  });

  test('email inexistente → 401 mensaje genérico', async () => {
    const res = await request(APP).post('/api/users/login').send({
      email: 'nadie@local.dev',
      password: 'admin123',
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas');
  });

  test('password incorrecta → 401', async () => {
    const res = await request(APP).post('/api/users/login').send({
      email: 'admin@local.dev',
      password: 'otra-password',
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas');
  });

  test('email inválido → 400', async () => {
    const res = await request(APP).post('/api/users/login').send({
      email: 'no-es-un-email',
      password: 'admin123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('password corta → 400', async () => {
    const res = await request(APP).post('/api/users/login').send({
      email: 'admin@local.dev',
      password: '123',
    });
    expect(res.status).toBe(400);
  });
});

describe('requireAuth (middleware protegido)', () => {
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
    const res = await request(APP).get('/api/analytics');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token no proporcionado');
  });

  test('Authorization sin Bearer → 401', async () => {
    const res = await request(APP).get('/api/analytics').set('Authorization', token);
    expect(res.status).toBe(401);
  });

  test('token inválido → 401', async () => {
    const res = await request(APP).get('/api/analytics').set(auth('token.rotto.invalido'));
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token inválido o expirado');
  });

  test('token válido → pasa el guard', async () => {
    const res = await request(APP).get('/api/analytics').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});