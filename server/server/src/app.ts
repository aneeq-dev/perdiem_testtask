import './config/env.loader';

import express, { Application } from 'express';
import userRoutes from './routes/user.routes';
import cacheRoutes from './routes/cache.routes';
import squareRoutes from './routes/square.routes';
import {
  setupSecurityMiddleware,
  requestSizeLimiter,
  noSniffMiddleware,
  xssProtectionMiddleware,
} from './middleware/security.middleware';
import {
  rateLimiterMiddleware,
  burstRateLimiterMiddleware,
} from './middleware/rate-limiter.middleware';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import {
  requestLoggerMiddleware,
  responseTimeMiddleware,
} from './middleware/request-logger.middleware';

const app: Application = express();

setupSecurityMiddleware(app);

app.use(requestLoggerMiddleware);
app.use(responseTimeMiddleware);
app.use(noSniffMiddleware);
app.use(xssProtectionMiddleware);
app.use(requestSizeLimiter);

app.use(burstRateLimiterMiddleware);
app.use(rateLimiterMiddleware);

app.use('/users', userRoutes);
app.use('/cache', cacheRoutes);
app.use('/api', squareRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;

