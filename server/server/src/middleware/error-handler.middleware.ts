import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/api.types';
import { AppError, ValidationError } from '../types/error.types';
import { ValidationErrorDetail } from '../types/validation.types';
import { APP_CONFIG } from '../config/app.config';

export const errorHandlerMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'An unexpected error occurred';
  let errorName = 'Internal Server Error';
  let errors: ValidationErrorDetail[] | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorName = err.name;

    if (err instanceof ValidationError && err.errors) {
      errors = err.errors;
    }
  } else {
    errorName = err.name || 'Internal Server Error';
    message = err.message || message;
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: errorName,
    message,
    ...(errors && { errors }),
  };

  if (statusCode >= 500) {
    console.error('💥 Server Error:', {
      name: err.name,
      message: err.message,
      stack: APP_CONFIG.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    console.warn('⚠️  Client Error:', {
      statusCode,
      message,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  }

  res.status(statusCode).json(errorResponse);
};
