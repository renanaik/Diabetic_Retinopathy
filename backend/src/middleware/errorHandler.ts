/**
 * errorHandler.ts
 * Centralized error-handling middleware for RetinaCare AI.
 *
 * Must be the LAST middleware registered in server.ts (Express convention).
 * Stack traces are suppressed in production.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const isDev = process.env.NODE_ENV !== 'production';

// ─── Custom error type ────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Error handler ────────────────────────────────────────────────────────────

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = (err as AppError).statusCode ?? 500;

  logger.error(`${req.method} ${req.originalUrl} → ${statusCode} — ${err.message}`);

  const response: Record<string, unknown> = {
    success: false,
    message: err.message || 'An unexpected error occurred',
  };

  // Include stack trace in development only
  if (isDev && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
