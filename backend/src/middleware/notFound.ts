/**
 * notFound.ts
 * 404 middleware — catches requests to unregistered routes.
 * Must be registered AFTER all real routes.
 */

import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
