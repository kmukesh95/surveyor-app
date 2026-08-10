import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants';
import { ENV } from '../config/env';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`❌ [Error Handler] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'An unexpected internal server error occurred.';

  const errorDetails = ENV.NODE_ENV === 'development' ? { stack: err.stack } : undefined;

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errorDetails && { error: errorDetails }),
    timestamp: new Date().toISOString(),
  });
};
