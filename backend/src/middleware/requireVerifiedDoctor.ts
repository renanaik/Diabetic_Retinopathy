/**
 * requireVerifiedDoctor.ts — Verified Doctor Authorization Middleware
 *
 * Must be used AFTER the authenticate middleware.
 *
 * Verifies that:
 *   1. The user is authenticated (req.user exists)
 *   2. The user's role is 'doctor'
 *   3. The user's verificationStatus is 'verified'
 *
 * Returns 401 if unauthenticated.
 * Returns 403 Forbidden with clear diagnostic message if not a doctor or not verified.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function requireVerifiedDoctor(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // req.user is set by authenticate middleware
  if (!req.user) {
    return next(new AppError('Authentication required before authorization check.', 401));
  }

  if (req.user.role !== 'doctor') {
    return next(
      new AppError('Access denied. This action is restricted to verified doctors only.', 403)
    );
  }

  if (req.user.verificationStatus === 'pending') {
    return next(
      new AppError(
        'Doctor account is pending verification by administration. Clinical access is restricted.',
        403
      )
    );
  }

  if (req.user.verificationStatus === 'rejected') {
    return next(
      new AppError(
        'Doctor verification request was rejected. Please contact support or resubmit credentials.',
        403
      )
    );
  }

  if (req.user.verificationStatus !== 'verified') {
    return next(
      new AppError('Access denied. Verified doctor status required.', 403)
    );
  }

  next();
}
