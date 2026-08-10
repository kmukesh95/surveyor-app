import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants';
import { ENV } from '../config/env';
import { encryptPayload } from '../utils/crypto';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  timestamp: string;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  error?: any
) => {
  const responseBody: ApiResponse<T> = {
    success,
    message,
    data: data !== undefined ? data : null,
    ...(error && { error }),
    timestamp: new Date().toISOString(),
  };

  // If payload encryption is enabled globally or per request header
  const shouldEncrypt = res.req.headers['x-encrypted-payload'] === 'true' || ENV.ENABLE_PAYLOAD_ENCRYPTION;
  
  if (shouldEncrypt && success && data) {
    const encryptedData = encryptPayload(responseBody);
    return res.status(statusCode).json({
      encrypted: true,
      payload: encryptedData,
      timestamp: responseBody.timestamp,
    });
  }

  return res.status(statusCode).json(responseBody);
};

export const sendSuccess = <T>(res: Response, message: string, data?: T, statusCode = HTTP_STATUS.OK) => {
  return sendResponse(res, statusCode, true, message, data);
};

export const sendError = (res: Response, message: string, statusCode = HTTP_STATUS.BAD_REQUEST, error?: any) => {
  return sendResponse(res, statusCode, false, message, undefined, error);
};

// Express extension typing
declare global {
  namespace Express {
    interface Response {
      sendSuccess: <T>(message: string, data?: T, statusCode?: number) => Response;
      sendError: (message: string, statusCode?: number, error?: any) => Response;
    }
  }
}

export const responseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.sendSuccess = function <T>(message: string, data?: T, statusCode = HTTP_STATUS.OK) {
    return sendSuccess(this, message, data, statusCode);
  };

  res.sendError = function (message: string, statusCode = HTTP_STATUS.BAD_REQUEST, error?: any) {
    return sendError(this, message, statusCode, error);
  };

  next();
};
