import test from 'node:test';
import assert from 'node:assert/strict';
process.env.SQUARE_ACCESS_TOKEN = 'test-token';
import request from 'supertest';
import app from '../app';

test('GET /api/catalog validates required location_id', async () => {
  const response = await request(app).get('/api/catalog');
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test('GET /api/locations returns mapped active locations', async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () =>
    ({
      ok: true,
      json: async () => ({
        locations: [
          { id: '1', name: 'A', timezone: 'UTC', status: 'ACTIVE', address: { locality: 'NY' } },
          { id: '2', name: 'B', timezone: 'UTC', status: 'INACTIVE', address: { locality: 'LA' } },
        ],
      }),
    }) as Response) as typeof fetch;

  const response = await request(app).get('/api/locations');
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.data[0].id, '1');
  global.fetch = originalFetch;
});

