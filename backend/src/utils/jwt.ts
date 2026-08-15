/**
 * jwt.ts — JWT sign and verify utilities
 *
 * Reads JWT_SECRET and JWT_EXPIRES_IN from the environment.
 * The secret is NEVER logged or exposed.
 *
 * Token payload carries only the minimum required for auth:
 *   - userId (MongoDB ObjectId as string)
 *   - role   (derived from DB; never trusted from client)
 */

import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';
import { logger } from './logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    logger.error('CONFIGURATION ERROR: JWT_SECRET is not set in environment.');
    process.exit(1);
  }
  return secret;
}

function getExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN ?? '7d';
}

// ─── Sign ─────────────────────────────────────────────────────────────────────

/**
 * Signs a JWT containing userId and role.
 * Expiry comes from JWT_EXPIRES_IN env (default 7d).
 */
export function signToken(userId: string, role: UserRole): string {
  const payload: JwtPayload = { userId, role };
  return jwt.sign(payload, getSecret(), {
    expiresIn: getExpiresIn(),
  } as jwt.SignOptions);
}

// ─── Verify ───────────────────────────────────────────────────────────────────

/**
 * Verifies a JWT and returns the decoded payload.
 * Throws a JsonWebTokenError or TokenExpiredError if invalid.
 */
export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getSecret()) as JwtPayload;
  return decoded;
}
