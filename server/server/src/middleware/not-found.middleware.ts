import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../types/error.types';

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(
    `Route ${req.method} ${req.originalUrl} not found`
  );
  next(error);
};

