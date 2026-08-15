/**
 * authenticate.ts — JWT authentication middleware
 *
 * Reads the Authorization header: "Bearer <token>"
 * Verifies the token, fetches the user from DB,
 * and attaches the safe user to req.user.
 *
 * Returns 401 if the token is missing, invalid, or expired.
 * Returns 401 if the user no longer exists or is inactive.
 *
 * The role is taken from the DATABASE, not the token,
 * to prevent stale token privilege escalation.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User, { IUser, SafeUser } from '../models/User';
import { AppError } from './errorHandler';

// ─── Extend Express Request ───────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    const token = authHeader.slice(7).trim(); // remove "Bearer "

    // 2. Verify JWT — throws if expired or tampered
    const decoded = verifyToken(token);

    // 3. Fetch fresh user from database (role comes from DB, not token)
    const user = (await User.findById(decoded.userId)) as IUser | null;

    if (!user) {
      return next(new AppError('User account no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // 4. Attach safe user (no passwordHash) to request
    req.user = user.toSafeObject();

    next();
  } catch (err) {
    // JWT errors (TokenExpiredError, JsonWebTokenError, etc.)
    if (err instanceof Error) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Session expired. Please log in again.', 401));
      }
      if (err.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid authentication token.', 401));
      }
    }
    next(err);
  }
}
