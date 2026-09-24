jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
      upload_stream: jest.fn((_opts: unknown, cb: (err: Error | null, res?: { secure_url: string }) => void) => {
        process.nextTick(() => cb(null, { secure_url: 'https://res.cloudinary.com/test/saas-gallery/x.webp' }));
        return { end: jest.fn() };
      }),
    },
  },
}));

import request from 'supertest';
import {
  connectTestDb,
  disconnectTestDb,
  resetDb,
  loginAsAdmin,
  APP,
  auth,
} from './bootstrap';

const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

describe('Gallery API', () => {
  let token: string;

  beforeAll(async () => {
    await connectTestDb();
    await resetDb();
    token = await loginAsAdmin();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test('todas las rutas requieren token (401 sin auth)', async () => {
    expect((await request(APP).get('/api/gallery/images')).status).toBe(401);
    expect((await request(APP).post('/api/gallery/upload')).status).toBe(401);
    expect((await request(APP).delete('/api/gallery/images/c10000000000000000000055')).status).toBe(401);
  });

  test('GET /api/gallery/images → 200 lista vacía al inicio', async () => {
    const res = await request(APP).get('/api/gallery/images').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  test('POST /api/gallery/upload sin archivo → 400', async () => {
    const res = await request(APP).post('/api/gallery/upload').set(auth(token));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/archivo/);
  });

  test('subir imagen (mock de Cloudinary) → 201 con url y publicId', async () => {
    const res = await request(APP)
      .post('/api/gallery/upload')
      .set(auth(token))
      .attach('image', PNG_1PX, 'test.png');
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe('https://res.cloudinary.com/test/saas-gallery/x.webp');
    expect(res.body.data.publicId).toMatch(/^saas-gallery\//);
    expect(res.body.data._id).toEqual(expect.any(String));
  });

  test('GET /api/gallery/images → 200 con la imagen subida', async () => {
    const res = await request(APP).get('/api/gallery/images').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].url).toContain('cloudinary.com');
  });

  test('DELETE /api/gallery/images/:id → 200 y la lista vuelve a vaciarse', async () => {
    const list = await request(APP).get('/api/gallery/images').set(auth(token));
    const id = list.body.data[0]._id;

    const del = await request(APP).delete(`/api/gallery/images/${id}`).set(auth(token));
    expect(del.status).toBe(200);
    expect(del.body.data.id).toBe(id);

    const after = await request(APP).get('/api/gallery/images').set(auth(token));
    expect(after.body.data).toEqual([]);
  });

  test('DELETE de imagen inexistente → 200 idempotente', async () => {
    const res = await request(APP)
      .delete('/api/gallery/images/c10000000000000000000055')
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('c10000000000000000000055');
  });
});