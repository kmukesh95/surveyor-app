import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { CacheService } from '../redis/redisClient';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  token?: string;
}

export const authenticateJwt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.sendError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);

    // Check if token is blacklisted in Redis
    const isBlacklisted = await CacheService.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.sendError('Token has been revoked. Please login again.', HTTP_STATUS.UNAUTHORIZED);
    }

    // Check active session in Redis
    const session = await CacheService.get(`session:${decoded.id}`);
    if (!session) {
      return res.sendError('Session expired. Please sign in again.', HTTP_STATUS.UNAUTHORIZED);
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (err: any) {
    return res.sendError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
  }
};
