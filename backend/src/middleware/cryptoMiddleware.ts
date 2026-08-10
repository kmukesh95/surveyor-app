import { Request, Response, NextFunction } from 'express';
import { decryptPayload } from '../utils/crypto';
import { HTTP_STATUS } from '../constants';

export const requestDecryptionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const isEncryptedHeader = req.headers['x-encrypted-payload'] === 'true';
    const isEncryptedBody = req.body && req.body.encrypted === true && req.body.payload;

    if (isEncryptedHeader || isEncryptedBody) {
      const payloadToDecrypt = req.body.payload || req.body;
      if (typeof payloadToDecrypt === 'string') {
        req.body = decryptPayload(payloadToDecrypt);
      }
    }
    next();
  } catch (error: any) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Payload decryption error: ${error.message}`,
      timestamp: new Date().toISOString(),
    });
  }
};
