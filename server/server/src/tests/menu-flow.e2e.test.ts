import test from 'node:test';
import assert from 'node:assert/strict';
process.env.SQUARE_ACCESS_TOKEN = 'test-token';
import request from 'supertest';
import app from '../app';

test('menu browsing flow returns locations, categories and catalog (e2e-style)', async () => {
  const originalFetch = global.fetch;
  global.fetch = (async (url: string | URL) => {
    const path = typeof url === 'string' ? url : url.toString();
    if (path.includes('/locations')) {
      return {
        ok: true,
        json: async () => ({
          locations: [{ id: 'loc-1', name: 'Main', timezone: 'UTC', status: 'ACTIVE', address: {} }],
        }),
      } as Response;
    }
    return {
      ok: true,
      json: async () => ({
        objects: [
          {
            id: 'item-1',
            type: 'ITEM',
            present_at_location_ids: ['loc-1'],
            item_data: {
              name: 'Burger',
              description: 'Tasty',
              category_id: 'cat-1',
              variations: [{ id: 'var-1', item_variation_data: { name: 'Regular', price_money: { amount: 1250 } } }],
            },
          },
        ],
        related_objects: [{ id: 'cat-1', type: 'CATEGORY', category_data: { name: 'Mains' } }],
      }),
    } as Response;
  }) as typeof fetch;

  const locations = await request(app).get('/api/locations');
  assert.equal(locations.status, 200);

  const categories = await request(app).get('/api/catalog/categories?location_id=loc-1');
  assert.equal(categories.status, 200);
  assert.equal(categories.body.data[0].name, 'Mains');

  const catalog = await request(app).get('/api/catalog?location_id=loc-1');
  assert.equal(catalog.status, 200);
  assert.equal(catalog.body.data[0].items[0].name, 'Burger');

  global.fetch = originalFetch;
});

