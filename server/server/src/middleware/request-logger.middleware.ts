import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { responseTimeTracker } from '../utils/response-time.util';
import { APP_CONFIG } from '../config/app.config';

const morganFormat = APP_CONFIG.NODE_ENV === 'production' ? 'combined' : 'dev';

export const requestLoggerMiddleware = morgan(morganFormat, {
  stream: {
    write: (message: string) => {
      console.log(message.trim());
    },
  },
});

export const responseTimeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const endpoint = `${req.method} ${req.path}`;

    responseTimeTracker.record(endpoint, responseTime);
  });

  next();
};
