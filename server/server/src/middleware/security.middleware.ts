import { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import { SECURITY_CONFIG } from '../config/security.config';
import { APP_CONFIG } from '../config/app.config';

export const setupSecurityMiddleware = (app: Application): void => {
  if (SECURITY_CONFIG.TRUST_PROXY) {
    app.set('trust proxy', 1);
  }

  app.use(helmet(SECURITY_CONFIG.HELMET));
  app.use(cors(SECURITY_CONFIG.CORS));
  app.use(compression());
  app.use(bodyParser.json(SECURITY_CONFIG.BODY_PARSER.json));
  app.use(bodyParser.urlencoded(SECURITY_CONFIG.BODY_PARSER.urlencoded));
};

export const requestSizeLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contentLength = req.get('content-length');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    res.status(413).json({
      success: false,
      error: 'Payload too large',
      message: 'Request body exceeds maximum size of 10MB',
    });
    return;
  }

  next();
};

export const noSniffMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};

export const xssProtectionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

