import test from 'node:test';
import assert from 'node:assert/strict';
import { responseTimeTracker } from '../utils/response-time.util';

test('response time tracker computes endpoint average (unit)', () => {
  responseTimeTracker.reset();
  responseTimeTracker.record('/x', 100);
  responseTimeTracker.record('/x', 300);
  assert.equal(responseTimeTracker.getAverage('/x'), 200);
});

