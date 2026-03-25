import rateLimit from 'express-rate-limit';

export const RATE_LIMIT_CONFIG = {
  BASE_LIMIT: 10, // Maximum 10 requests per minute
  BASE_WINDOW: 60 * 1000, // 1 minute in milliseconds
  BURST_LIMIT: 5, // Maximum 5 requests in burst window
  BURST_WINDOW: 10 * 1000, // 10 seconds in milliseconds
};

export const createRateLimiter = () => {
  return rateLimit({
    windowMs: RATE_LIMIT_CONFIG.BASE_WINDOW,
    max: RATE_LIMIT_CONFIG.BASE_LIMIT,
    message: {
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP, please try again later. Maximum 10 requests per minute.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return req.path === '/health';
    },
  });
};

export const createBurstRateLimiter = () => {
  return rateLimit({
    windowMs: RATE_LIMIT_CONFIG.BURST_WINDOW,
    max: RATE_LIMIT_CONFIG.BURST_LIMIT,
    message: {
      success: false,
      error: 'Burst rate limit exceeded',
      message: 'Too many requests in a short time. Maximum 5 requests per 10 seconds.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return req.path === '/health';
    },
  });
};

