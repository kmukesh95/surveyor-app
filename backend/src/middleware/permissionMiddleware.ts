import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { RoleType, HTTP_STATUS, ERROR_MESSAGES } from '../constants';

/**
 * Middleware enforcing Role-Based Access Control (RBAC)
 */
export const requireRoles = (...allowedRoles: RoleType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.sendError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!allowedRoles.includes(req.user.role as RoleType)) {
      return res.sendError(
        `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  };
};

/**
 * Ensures user is operating on their own profile or is an Admin/SuperAdmin
 */
export const requireSelfOrAdmin = (paramName = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.sendError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    const targetUserId = req.params[paramName] || req.body[paramName];
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);
    const isSelf = req.user.id === targetUserId;

    if (!isAdmin && !isSelf) {
      return res.sendError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    next();
  };
};
