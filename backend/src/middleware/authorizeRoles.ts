/**
 * authorizeRoles.ts — Role-based authorization middleware factory
 *
 * Must be used AFTER the authenticate middleware.
 *
 * Usage:
 *   router.get('/admin-only', authenticate, authorizeRoles('super_admin'), handler)
 *   router.get('/doctors',    authenticate, authorizeRoles('doctor', 'super_admin'), handler)
 *
 * Returns 403 Forbidden if the authenticated user's role is not in the allowed list.
 * The role is taken from req.user (set by authenticate middleware from the database).
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { AppError } from './errorHandler';

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // req.user is set by authenticate — if missing, a middleware ordering error occurred
    if (!req.user) {
      return next(new AppError('Authentication required before authorization check.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}.`,
          403
        )
      );
    }

    next();
  };
}
