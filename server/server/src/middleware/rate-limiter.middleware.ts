import { createRateLimiter, createBurstRateLimiter } from '../config/rate-limit.config';

export const rateLimiterMiddleware = createRateLimiter();
export const burstRateLimiterMiddleware = createBurstRateLimiter();

